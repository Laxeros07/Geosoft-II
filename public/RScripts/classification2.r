## librarys installieren
library(terra)
library(sf)
library(caret)
library(raster)
library(CAST)
library(cowplot)
library(tidyterra)
library(RColorBrewer)


# zum testen wd so setzen
setwd("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II")

rasterdaten <- rast(paste(
  getwd(),
  "/public/uploads/rasterdaten.tif",
  sep = ""
))
trainingsdaten <- read_sf(paste(
  getwd(),
  "/public/uploads/trainingsdaten.geojson",
  sep = ""
))
modell <- readRDS(paste(
  getwd(),
  "/public/uploads/modell.RDS",
  sep = ""
))

maske_raster <- c(7.55738996178022, 7.64064656833175, 51.9372943715445, 52.0001517816852)
maske_training <- c(xmin =7.55738996178022, ymin =51.9372943715445, xmax =7.64064656833175, ymax =52.0001517816852)
baumAnzahl <- NA
baumTiefe <- NA


## Ausgabe
klassifizierung_mit_Modell <- function(rasterdaten, modell, maske_raster) {
  
  # Rasterdaten zuschneiden
  rasterdaten <- crop(rasterdaten, maske_raster)
  
  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), modell)
  projection(prediction)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  farben <- brewer.pal(n = 12, name = "Paired")
  coltab(prediction_terra) <- farben#[0:10]

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
  terra::writeRaster(prediction_terra, paste(
    getwd(),
    "/public/uploads/prediction_modell.tif",
    sep = ""
  ), overwrite = TRUE)
  
  # Prediction Legende exportieren
  legend_plot <- ggplot()+
    geom_spatraster(data=prediction_terra)+
    scale_fill_manual(values=farben[2:12], na.value=NA)
  legend <- get_legend(legend_plot)
  
  ggsave(paste(
    getwd(),
    "/public/uploads/legend.png",
    sep = ""
  ), plot= legend, width = 2, height = 3)
  
  
  # Abfrage, ob bereits eine AOA gerechnet wurde
  AOA_Differenz_nötig <- FALSE
  if(file.exists(paste(
    getwd(),
    "/public/uploads/AOA_klassifikation.tif",
    sep = ""
  ))){
    AOA_Differenz_nötig <- TRUE
    AOA_klassifikation_alt<- rast(paste(
      getwd(),
      "/public/uploads/AOA_klassifikation.tif",
      sep = ""
    ))
  }
  
  # AOA Berechnungen
  AOA_klassifikation <- aoa(rasterdaten,modell)
  crs(AOA_klassifikation$AOA)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  crs(AOA_klassifikation$DI)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  #plot(AOA_klassifikation$DI)
  #plot(AOA_klassifikation$AOA)
  terra::writeRaster(AOA_klassifikation$AOA, paste(
    getwd(),
    "/public/uploads/AOA_klassifikation_modell.tif",
    sep = ""
  ), overwrite = TRUE)
  
  # DI Berechnungen
  maxDI <- selectHighest(AOA_klassifikation$DI, 3000)
  crs(maxDI)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  #terra::writeRaster(maxDI, paste(
  #  getwd(),
  #  "/public/uploads/maxDI.tif",
  #  sep = ""
  #), overwrite = TRUE)
  
  # DI als GeoJSON exportieren
  maxDIVector <- as.polygons(maxDI)
  crs(maxDIVector)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeVector(maxDIVector, paste(
    getwd(),
    "/public/uploads/maxDI.geojson",
    sep = ""
  ), filetype="geojson", overwrite = TRUE)
  
  # AOA Differenz berechnen
  if(AOA_Differenz_nötig == TRUE){
    AOA_klassifikation_alt <- crop(AOA_klassifikation_alt, ext(AOA_klassifikation$AOA))
    AOA_klassifikation$AOA <- crop(AOA_klassifikation$AOA, ext(AOA_klassifikation_alt))
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, paste(
      getwd(),
      "/public/uploads/AOADifferenz.tif",
      sep = ""
    ), overwrite = TRUE)
  } # 1=Verbesserung der AOA; 0=keine Veränderung; -1=Verschlechterung der AOA
}


## Ausgabe
klassifizierung_ohne_Modell <- function(rasterdaten, trainingsdaten, maske_raster, maske_training, baumAnzahl, baumTiefe) {
  ## Variablen definieren
  predictors <- c(
    "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B8A", "B09", "B10", "B11", "B12")

  # Rasterdaten zuschneiden
  rasterdaten <- crop(rasterdaten, maske_raster)
  
  # Trainingsdaten zuschneiden
  class(maske_raster) <- "numeric"
  #class(maske_raster)
  #plot(ext(maske_training))
  sf_use_s2(FALSE)
  trainingsdaten2 <- st_make_valid(trainingsdaten)
  trainingsdaten <- st_crop(trainingsdaten2, ext(maske_training))
  plot(trainingsdaten)

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

  # Hyperparameter für Modelltraining abfragen
  if(is.na(baumAnzahl)){
    baumAnzahl <- 50
  }
  if(is.na(baumTiefe)){
    baumTiefe <- 100
  }
  #### Modelltraining
  model <- train(trainDat[, predictors],
    trainDat$Label,
    method = "rf",
    importance = TRUE,
    ntree = baumAnzahl,  # Anzahl der Bäume
    maxnodes = baumTiefe   # Tiefe der Bäume
  ) # 50 is quite small (default=500). But it runs faster.
  
  model <- train(trainDat[, predictors],
                 trainDat$Label,
                 method="rpart", 
                 trControl = trainControl(method = "cv")   # Classification Tree Algorithmus
  ) # nicht so gut wie rf Algorithmus
  #model
   #saveRDS(model, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/uploads/modell.RDS")
  saveRDS(model, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/uploads/modell.RDS")
  #?saveRDS
  # model
  # plot(model) # see tuning results
  # plot(varImp(model)) # variablenwichtigkeit

  # Farbpalette
  cols <- c(
    "beige", "sandybrown",
    "blue3", "red", "magenta", "red", "darkgoldenrod", "lightgreen", "blue", "green", "deeppink4", "grey", "chartreuse", "deeppink3",
    "deepskyblue4", "forestgreen", "brown", "darkgreen"
  )
  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), model)#, colors(cols))
  projection(prediction)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  farben <- brewer.pal(n = 12, name = "Paired")
  coltab(prediction_terra) <- farben#[0:10]
  #coltab(prediction_terra) <- cols

  # erste Visualisierung der Klassifikation:
  # plot(prediction_terra)

  # plot(prediction_terra,col=cols)

  # export raster
  # writeRaster(prediction_terra,"prediction.grd",overwrite=TRUE)

  # return(plot(prediction_terra)) # ,col=cols))

   #tiff(paste(
  #  getwd(),
  # "/public/uploads/prediction.geotiff",
  #  sep = ""
  # ))
  # terra::plot(prediction_terra,col=cols, legend=FALSE, axes = FALSE, buffer=FALSE)
  # dev.off()
  # ?writeRaster
   #?terra::plot
   #prediction_terra
   #png(paste(
  #   getwd(),
  #   "/public/uploads/prediction.geotiff",
  #   sep = ""
  # ), bg="transparent")
  # plot(NULL ,xaxt='n',yaxt='n',bty='n',ylab='',xlab='', xlim=0:1, ylim=0:1)
  # legend("topleft", legend =prediction_terra$names, pch=16, pt.cex=3, cex=1.5, bty='n',
  #                      col = cols)
  #                      mtext("Species", at=0.2, cex=2)
  # dev.off()
  # ?terra::plot
  # writeRaster(prediction_terra, "D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/uploads/prediction.tif", overwrite = TRUE)
  # filename <- paste(normalizePath("D:/Dokumente/Studium"), "\\prediction.tif", sep = "")
  # stop(getwd())
  terra::writeRaster(prediction_terra, paste(
    getwd(),
    "/public/uploads/prediction.tif",
    sep = ""
  ), overwrite = TRUE)
  
  # Prediction Legende exportieren
  legend_plot <- ggplot()+
    geom_spatraster(data=prediction_terra)+
    scale_fill_manual(values=farben[2:12], na.value=NA)
  legend <- get_legend(legend_plot)

  ggsave(paste(
    getwd(),
    "/public/uploads/legend.png",
    sep = ""
  ), plot= legend, width = 2, height = 3)
  
  
  #plot(prediction_terra)
  #writeRaster(prediction_terra, filename="public/uploads/prediction2.tif", format="GTiff", overwrite=TRUE)
  # library(tmap)
  # crs(prediction_terra) <- "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
  # map <- tm_shape(prediction_terra,
  #                raster.downsample = FALSE) +
  #  tm_raster(palette = cols,title = "LUC")+
  #  tm_scale_bar(bg.color="white")+
  #  tm_grid(n.x=4,n.y=4,projection="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")+
  #  tm_layout(legend.position = c("left","bottom"),
  #            legend.bg.color = "white",
  #            legend.bg.alpha = 0.8)#+

  # tmap_save(map, paste(
  #  getwd(),
  #  "/public/uploads/map.png",
  #  sep = ""
  # ))
  
  # Abfrage, ob bereits eine AOA gerechnet wurde
  AOA_Differenz_nötig <- FALSE
  if(file.exists(paste(
    getwd(),
    "/public/uploads/AOA_klassifikation.tif",
    sep = ""
  ))){
    AOA_Differenz_nötig <- TRUE
    AOA_klassifikation_alt<- rast(paste(
      getwd(),
      "/public/uploads/AOA_klassifikation.tif",
      sep = ""
    ))
  }

  # AOA Berechnungen
  AOA_klassifikation <- aoa(rasterdaten,model)
  crs(AOA_klassifikation$AOA)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  crs(AOA_klassifikation$DI)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  #plot(AOA_klassifikation$DI)
  #plot(AOA_klassifikation$AOA)
  
  terra::writeRaster(AOA_klassifikation$AOA, paste(
    getwd(),
    "/public/uploads/AOA_klassifikation.tif",
    sep = ""
  ), overwrite = TRUE) # 1=gute AOA; 0=schlechte AOA
  
  # DI Berechnungen
  maxDI <- selectHighest(AOA_klassifikation$DI, 3000)
  crs(maxDI)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  #terra::writeRaster(maxDI, paste(
  #  getwd(),
  #  "/public/uploads/maxDI.tif",
  #  sep = ""
  #), overwrite = TRUE)
  
  # DI als GeoJSON exportieren
  maxDIVector <- as.polygons(maxDI)
  crs(maxDIVector)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeVector(maxDIVector, paste(
    getwd(),
    "/public/uploads/maxDI.geojson",
    sep = ""
  ), filetype="geojson", overwrite = TRUE)
  
  # AOA Differenz berechnen
  if(AOA_Differenz_nötig == TRUE){
    AOA_klassifikation_alt <- crop(AOA_klassifikation_alt, ext(AOA_klassifikation$AOA))
    AOA_klassifikation$AOA <- crop(AOA_klassifikation$AOA, ext(AOA_klassifikation_alt))
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, paste(
      getwd(),
      "/public/uploads/AOADifferenz.tif",
      sep = ""
    ), overwrite = TRUE)
  } # 1=Verbesserung der AOA; 0=keine Veränderung; -1=Verschlechterung der AOA
}
#aoa_alt <- rast(paste(
#  getwd(),
#  "/public/uploads/AOA_klassifikation.tif",
#  sep = ""
#))
#aoa_neu <- rast(paste(
#  getwd(),
#  "/public/uploads/AOA_klassifikation_modell.tif",
#  sep = ""
#))
#test <- aoa_neu - aoa_alt
#test
#plot(aoa_alt) # 1=gut 0=schlecht
#plot(test) # 1=Verbesserung der AOA 0=keine Veränderung -1=Verschlechterung

# zum Testen der Funktionen
 klassifizierung_mit_Modell(rasterdaten, modell, maske_raster)
 klassifizierung_ohne_Modell(rasterdaten, trainingsdaten, maske_raster, maske_training, baumAnzahl, baumTiefe)
