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
  # setwd('..')
  # setwd('..')
  # setwd('..')
  st_write(data, "myfiles/trainingsdaten.geojson", delete_dsn = TRUE)
}

#* Klassifikation ohne Modell
#* @get /result
#* @serializer png
function() {
  library(terra)
  library(sf)
  library(caret)
  library(raster)
  library(RColorBrewer)
  # return(getwd()) #/usr/src/app
  # rasterdaten <- rast("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/uploads/rasterdaten.tif") # nolint
  # trainingsdaten <- read_sf("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/uploads/trainingsdaten.geojson") # nolint
  rasterdaten <- rast("http://172.17.0.1:3000/uploads/rasterdaten.tif")
  trainingsdaten <- read_sf("http://172.17.0.1:3000/uploads/trainingsdaten.geojson")

  ## Variablen definieren
  predictors <- c(
    "B02", "B03", "B04", "B08", "B05", "B06", "B07", "B11",
    "B12", "B8A"
  )

  # Trainingsdaten umprojizieren, falls die Daten verschiedene CRS haben
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))

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


  #### Modelltraining
  model <- train(trainDat[, predictors],
    trainDat$Label,
    method = "rf",
    importance = TRUE,
    ntree = 50
  ) # 50 is quite small (default=500). But it runs faster.
  # saveRDS(model, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/RFModel2.RDS")

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
  prediction_terra <- as(prediction, "SpatRaster")
  coltab(prediction_terra) <- brewer.pal(n = 10, name = "RdBu")

  # erste Visualisierung der Klassifikation:
  # plot(prediction_terra)

  # und nochmal in schöner plotten mit sinnvollen Farben
  cols <- c(
    "lightgreen", "blue", "green", "darkred", "forestgreen",
    "darkgreen", "beige", "darkblue", " firebrick1", "red", "yellow"
  )

  # coltab(prediction_terra) <- brewer.pal(n = 10, name = "RdBu")
  # levels(r) <- data.frame(id=1:9, cover=c("Acker_bepflanzt","Fliessgewässer","Gruenland","Industriegebiet", "Laubwald", "Mischwald", "Offenboden", "See", "Siedlung"))

  # terra::writeRaster(prediction_terra, "../public/uploads/prediction.tif", overwrite = TRUE)


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
  plot(prediction_terra, col = cols)
}


# root <- pr("plumber.R")
# root

# root %>% pr_run()
