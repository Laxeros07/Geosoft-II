# plumber.R

#* Echo the parameter that was sent in
#* @param msg The message to echo back.
#* @get /echo
function(msg = "") {
  list(msg = paste0("The message is: '", msg, "'"))
}

#* Plot out data from the iris dataset
#* @param spec If provided, filter the data to only this species (e.g. 'setosa')
#* @get /plot
#* @serializer png
function(spec) {
  myData <- iris
  title <- "All Species"

  # Filter if the species was specified
  if (!missing(spec)) {
    title <- paste0("Only the '", spec, "' Species")
    myData <- subset(iris, Species == spec)
  }

  plot(myData$Sepal.Length, myData$Petal.Length,
    main = title, xlab = "Sepal Length", ylab = "Petal Length"
  )
}

#* Umwandeln von Geopackage zu GeoJSON
#* @get /convert
#* @serializer json
function() {
  library(sf)
  data <- st_read("myfiles/trainingsdaten.gpkg")
  st_write(data, "myfiles/trainingsdaten.geojson", delete_dsn = TRUE)
}

#* Klassifikation ohne Modell
#* @param ymin,ymax,xmin,xmax If provided, Zuschnitt fuer die Rasterdaten
#* @get /result
#* @serializer png
function(ymin = NA, ymax = NA, xmin = NA, xmax = NA, baumAnzahl = NA, baumTiefe = NA) {
  library(terra)
  library(sf)
  library(caret)
  library(raster)
  library(RColorBrewer)
  library(CAST)
  library(cowplot)
  library(tidyterra)

  # ymin <- 51.950635
  # ymax <- 51.998432
  # xmin <- 7.560220
  # xmax <- 7.638644

  maske_raster <- c(xmin, xmax, ymin, ymax)
  maske_training <- c(xmin = xmin, ymin = ymin, xmax = xmax, ymax = ymax)

  class(maske_raster) <- "numeric"
  class(maske_training) <- "numeric"

  rasterdaten <- rast("myfiles/rasterdaten.tif")
  trainingsdaten <- read_sf("myfiles/trainingsdaten.geojson")
  # trainingsdaten <- read_sf("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/beispieldaten/trainingsdaten.geojson")
  # rasterdaten <- rast("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/uploads/rasterdaten.tif")

  ## Variablen definieren
  predictors <- c(
    "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12"
  )

  # Trainingsdaten umprojizieren, falls die Daten verschiedene CRS haben
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))

  # Daten auf Maske zuschneiden
  if (!(is.na(ymin) || is.na(ymax) || is.na(xmin) || is.na(xmax))) {
    rasterdaten <- crop(rasterdaten, ext(maske_raster))
    sf_use_s2(FALSE)
    trainingsdaten2 <- st_make_valid(trainingsdaten)
    trainingsdaten <- st_crop(trainingsdaten2, maske_training)
  } else {
    sf_use_s2(FALSE)
    trainingsdaten2 <- st_make_valid(trainingsdaten)
    trainingsdaten <- st_crop(trainingsdaten2, ext(rasterdaten))
  }

  # Daten mergen
  extr <<- extract(rasterdaten, trainingsdaten)
  # head(extr)
  # head(trainingsdaten)
  trainingsdaten$PolyID <- 1:nrow(trainingsdaten)
  extr <<- merge(extr, trainingsdaten, by.x = "ID", by.y = "PolyID")
  # head(extr)


  # Modell trainieren
  # nicht alle Daten verwenden um Rechenzeit zu sparen
  extr_subset <- extr[createDataPartition(extr$ID, p = 0.2)$Resample1, ]

  # eventuell Daten limitieren.
  # Verhälnis der Daten aus jedem Trainingsgebiet soll aber gleich bleiben
  # hier:10% aus jedem Trainingsgebiet (see ?createDataPartition)
  trainIDs <- createDataPartition(extr$ID, p = 0.1, list = FALSE)
  trainDat <- extr[trainIDs, ]
  # Sicherstellen das kein NA in Prädiktoren enthalten ist:
  trainDat <- trainDat[complete.cases(trainDat[, predictors]), ]


  # Hyperparameter für Modelltraining abfragen
  if (is.na(baumAnzahl)) {
    baumAnzahl <- 50 # 50 is quite small (default=500). But it runs faster.
  }
  class(baumAnzahl) <- "numeric"

  if (is.na(baumTiefe)) {
    baumTiefe <- 100
  }
  class(baumTiefe) <- "numeric"

  #### Modelltraining
  model <- train(trainDat[, predictors],
    trainDat$Label,
    method = "rf",
    importance = TRUE,
    ntree = baumAnzahl,
    maxnodes = baumTiefe
  )
  saveRDS(model, "myfiles/RFModel2.RDS")

  # model
  # plot(model) # see tuning results
  # plot(varImp(model)) # variablenwichtigkeit

  cols <- c(
    "beige", "sandybrown",
    "blue3", "red", "magenta", "red", "darkgoldenrod", "lightgreen", "blue", "green", "deeppink4", "grey", "chartreuse", "deeppink3",
    "deepskyblue4", "forestgreen", "brown", "darkgreen"
  )

  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), model)
  projection(prediction) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  farben <- brewer.pal(n = 12, name = "Paired")
  coltab(prediction_terra) <- farben # [0:10]

  terra::writeRaster(prediction_terra, "myfiles/prediction.tif", overwrite = TRUE)

  # Prediction Legende exportieren
  legend_plot <- ggplot() +
    geom_spatraster(data = prediction_terra) +
    scale_fill_manual(values = farben[2:12], na.value = NA)
  legend <- get_legend(legend_plot)

  ggsave("myfiles/legend.png", plot = legend, width = 1.7, height = 2.7)

  # Abfrage, ob bereits eine AOA gerechnet wurde
  AOA_Differenz_nötig <- FALSE
  if (file.exists("myfiles/AOA_klassifikation.tif")) {
    AOA_Differenz_nötig <- TRUE
    AOA_klassifikation_alt <- rast("myfiles/AOA_klassifikation.tif")
  }

  # AOA Berechnungen
  AOA_klassifikation <- aoa(rasterdaten, model)
  crs(AOA_klassifikation$AOA) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  crs(AOA_klassifikation$DI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # plot(AOA_klassifikation$DI)
  # plot(AOA_klassifikation$AOA)
  terra::writeRaster(AOA_klassifikation$AOA, "myfiles/AOA_klassifikation.tif", overwrite = TRUE)
  # coltab(prediction_terra) <- brewer.pal(n = 10, name = "RdBu")
  # levels(r) <- data.frame(id=1:9, cover=c("Acker_bepflanzt","Fliessgewässer","Gruenland","Industriegebiet", "Laubwald", "Mischwald", "Offenboden", "See", "Siedlung"))

  # DI Berechnungen
  maxDI <- selectHighest(AOA_klassifikation$DI, 3000)
  crs(maxDI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # terra::writeRaster(maxDI, "myfiles/maxDI.tif", overwrite = TRUE)

  # DI als GeoJSON exportieren
  maxDIVector <- as.polygons(maxDI)
  crs(maxDIVector)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeVector(maxDIVector, "myfiles/maxDI.geojson", filetype="geojson", overwrite = TRUE)

  # AOA Differenz berechnen
  if (AOA_Differenz_nötig == TRUE) {
    AOA_klassifikation_alt <- crop(AOA_klassifikation_alt, ext(AOA_klassifikation$AOA))
    AOA_klassifikation$AOA <- crop(AOA_klassifikation$AOA, ext(AOA_klassifikation_alt))
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, "myfiles/AOADifferenz.tif", overwrite = TRUE)
  } # 1=Verbesserung der AOA; 0=keine Veränderung; -1=Verschlechterung der AOA

  # tiff(paste(
  #  getwd(),
  # "/public/uploads/prediction.tif",
  #  sep = ""
  # ))
  # plot(prediction_terra,col=cols, legend=FALSE)
  # dev.off()

  # writeRaster(prediction_terra, "D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/uploads/prediction.tif", overwrite = TRUE)
  # filename <- paste(normalizePath("D:/Dokumente/Studium"), "\\prediction.tif", sep = "")
  # stop(getwd())
  # terra::writeRaster(prediction_terra, "D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/uploads/prediction.tif", overwrite = TRUE)
  # plot(prediction_terra, col = cols)
}

#* Klassifikation mit Modell
#* @param maske If provided, Zuschnitt fuer die Rasterdaten
#* @get /resultModell
#* @serializer png
function(ymin = NA, ymax = NA, xmin = NA, xmax = NA) {
  library(terra)
  library(sf)
  library(caret)
  library(raster)
  library(CAST)
  library(RColorBrewer)
  library(cowplot)
  library(tidyterra)

  maske_raster <- c(xmin, xmax, ymin, ymax)
  maske_training <- c(xmin = xmin, ymin = ymin, xmax = xmax, ymax = ymax)

  class(maske_raster) <- "numeric"
  class(maske_training) <- "numeric"

  rasterdaten <- rast("myfiles/rasterdaten.tif")
  modell <- readRDS("myfiles/modell.RDS")

  # Daten auf Maske zuschneiden
  if (!(is.na(ymin) || is.na(ymax) || is.na(xmin) || is.na(xmax))) {
    rasterdaten <- crop(rasterdaten, ext(maske_raster))
  }

  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), modell)
  projection(prediction) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  farben <- brewer.pal(n = 12, name = "Paired")
  coltab(prediction_terra) <- farben # [0:10]

  # erste Visualisierung der Klassifikation:
  # plot(prediction_terra)

  # und nochmal in schöner plotten mit sinnvollen Farben
  cols <- c(
    "lightgreen", "blue", "green", "darkred", "forestgreen",
    "darkgreen", "beige", "darkblue", " firebrick1", "red", "yellow"
  )
  # plot(prediction_terra,col=cols)

  # export raster
  # writeRaster(prediction_terra,"prediction.grd",overwrite=TRUE)
  # return(plot(prediction_terra)) # ,col=cols))
  terra::writeRaster(prediction_terra, "myfiles/prediction.tif", overwrite = TRUE)

  # Prediction Legende exportieren
  legend_plot <- ggplot() +
    geom_spatraster(data = prediction_terra) +
    scale_fill_manual(values = farben[2:12], na.value = NA)
  legend <- get_legend(legend_plot)

  ggsave("myfiles/legend.png", plot = legend, width = 1.7, height = 2.7)

  # Abfrage, ob bereits eine AOA gerechnet wurde
  AOA_Differenz_nötig <- FALSE
  if (file.exists("myfiles/AOA_klassifikation.tif")) {
    AOA_Differenz_nötig <- TRUE
    AOA_klassifikation_alt <- rast("myfiles/AOA_klassifikation.tif")
  }

  # AOA Berechnungen
  AOA_klassifikation <- aoa(rasterdaten, modell)
  crs(AOA_klassifikation$AOA) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  crs(AOA_klassifikation$DI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # plot(AOA_klassifikation$DI)
  # plot(AOA_klassifikation$AOA)
  terra::writeRaster(AOA_klassifikation$AOA, "myfiles/AOA_klassifikation.tif", overwrite = TRUE)

  # DI Berechnungen
  maxDI <- selectHighest(AOA_klassifikation$DI, 3000)
  crs(maxDI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # terra::writeRaster(maxDI, "myfiles/maxDI.tif", overwrite = TRUE)

  # DI als GeoJSON exportieren
  maxDIVector <- as.polygons(maxDI)
  crs(maxDIVector)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeVector(maxDIVector, "myfiles/maxDI.geojson", filetype="geojson", overwrite = TRUE)

  # AOA Differenz berechnen
  if (AOA_Differenz_nötig == TRUE) {
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, "myfiles/AOADifferenz.tif", overwrite = TRUE)
  } # 1=Verbesserung der AOA; 0=keine Veränderung; -1=Verschlechterung der AOA
}

# root <- pr("plumber.R")
# root

# root %>% pr_run()
