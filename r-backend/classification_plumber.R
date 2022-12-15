#* Klassifikation ohne Modell
#* @param x
#* @post /result
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

  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), model)
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
  # writeRaster(prediction_terra, paste(
  #  getwd(),
  #  "/public/uploads/prediction.png",
  #  sep = ""
  #), overwrite = TRUE)
  # return(plot(prediction_terra)) # ,col=cols))
  
  tiff(paste(
    getwd(),
    "/public/uploads/prediction.tif",
    sep = ""
  ))
  plot(prediction_terra, col=cols, legend=FALSE, axes=FALSE)
  dev.off()
  
  
  
}