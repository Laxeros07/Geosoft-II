## librarys installieren
library(terra)
library(sf)
library(caret)
library(raster)

## globale Variablen definieren
predictors <- c("B02","B03","B04","B08","B05","B06","B07","B11",
                "B12","B8A","NDVI","NDVI_3x3_sd","NDVI_5x5_sd")
extr <- NULL


## Ausgabe
klassifizierung = function(rasterdaten, trainingsdaten) {
  return (klassifizieren(rasterdaten, trainingsdaten))
}

## nur zum testen
rasterdaten <- rast("C:/Users/Felix/Desktop/Studium/Uni Fächer/5. Semester/Fernerkundung Maschinelles Lernen/R-Skripte/erstesProjekt/predictors_selm.tif")
trainingsdaten <- read_sf("C:/Users/Felix/Desktop/Studium/Uni Fächer/5. Semester/Fernerkundung Maschinelles Lernen/Selm_Klassifikation_QGis/Trainingspolygone_Selm.gpkg")


# Trainingsdaten umprojizieren, falls die Daten verschiedene CRS haben
umprojizieren = function(rasterdaten, trainingsdaten) {
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))
}

# Daten mergen
zusammenfuegen = function(rasterdaten, trainingsdaten) {
  umprojizieren(rasterdaten, trainingsdaten)
  
  extr <<- extract(rasterdaten,trainingsdaten)
  #head(extr)
  #head(trainingsdaten)
  trainingsdaten$PolyID <- 1:nrow(trainingsdaten) 
  extr <<- merge(extr,trainingsdaten,by.x="ID",by.y="PolyID")
  #head(extr)
}

# Modell trainieren
modelltraining = function(rasterdaten, trainingsdaten, extr) {
  zusammenfuegen(rasterdaten, trainingsdaten)
  return (extr)
  #nicht alle Daten verwenden um Rechenzeit zu sparen
  extr_subset <- extr[createDataPartition(extr$ID,p=0.2)$Resample1,]
  
  #eventuell Daten limitieren.
  #Verhälnis der Daten aus jedem Trainingsgebiet soll aber gleich bleiben
  # hier:10% aus jedem Trainingsgebiet (see ?createDataPartition)
  #trainIDs <- createDataPartition(extr$ID,p=0.1,list = FALSE)
  #trainDat <- extr[trainIDs,]
  #Sicherstellen das kein NA in Prädiktoren enthalten ist:
  #trainDat <- trainDat[complete.cases(trainDat[,predictors]),]
  
  
  #### Modelltraining
  #model <- train(extr_subset[,predictors],
  #               extr_subset$Label,
  #               method="rf",
  #               importance=TRUE,
  #               ntree=50) # 50 is quite small (default=500). But it runs faster.
  
  #model
  #plot(model) # see tuning results
  #plot(varImp(model)) # variablenwichtigkeit
}

klassifizieren = function(rasterdaten, trainingsdaten) {
  modelltraining(rasterdaten, trainingsdaten)
  
  ###little detour due to terra/raster change
  prediction <- predict(as(rasterdaten,"Raster"),model)
  prediction_terra <- as(prediction,"SpatRaster")
  
  # erste Visualisierung der Klassifikation:
  #plot(prediction_terra)
  
  # und nochmal in schöner plotten mit sinnvollen Farben
  cols <- c( "lightgreen","blue", "green","darkred","forestgreen",
             "darkgreen","beige","darkblue"," firebrick1","red","yellow")
  plot(prediction_terra,col=cols)
  
  # export raster
  writeRaster(prediction_terra,"prediction.grd",overwrite=TRUE)
}



umprojizieren(rasterdaten, trainingsdaten)
zusammenfuegen(rasterdaten, trainingsdaten)
modelltraining(rasterdaten, trainingsdaten, extr)
klassifizierung(rasterdaten, trainingsdaten)