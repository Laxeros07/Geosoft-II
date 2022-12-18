## librarys installieren
library(terra)
library(sf)
library(caret)
library(raster)


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

## Ausgabe
klassifizierung_mit_Modell <- function(rasterdaten, modell) {
  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), modell)
  prediction_terra <- as(prediction, "SpatRaster")

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
  return(plot(prediction_terra)) # ,col=cols))
}


## Ausgabe
klassifizierung_ohne_Modell <- function(x) {
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
  prediction <- predict(as(rasterdaten, "Raster"), model)#, colors(cols))
  projection(prediction)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  coltab(prediction_terra) <- cols
  #?predict
  # erste Visualisierung der Klassifikation:
  # plot(prediction_terra)

  # und nochmal in schöner plotten mit sinnvollen Farben
  cols <- c(
    "beige", "sandybrown",
    "blue3", "red", "magenta", "red", "darkgoldenrod", "lightgreen", "blue", "green", "deeppink4", "grey", "chartreuse", "deeppink3",
    "deepskyblue4", "forestgreen", "brown", "darkgreen"

  )
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
   ?writeRaster
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
    "/public/beispieldaten/prediction.tif",
    sep = ""
  ), overwrite = TRUE)
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
}



# zum Testen der Funktionen
# klassifizierung_mit_Modell(rasterdaten, modell)
 klassifizierung_ohne_Modell()
