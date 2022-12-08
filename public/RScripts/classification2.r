## librarys installieren
library(terra)
library(sf)
library(caret)
library(raster)


## nur zum testen
rasterdaten <- rast("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/sentinelRaster2_umprojiziert.tif")
trainingsdaten <- read_sf("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/trainingsgebiete.geojson")
modell <- readRDS("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/RFModel2.RDS")

## Ausgabe
klassifizierung_mit_Modell = function(rasterdaten, modell) {

#klassifizieren
###little detour due to terra/raster change
  prediction <- predict(as(rasterdaten,"Raster"),modell)
  prediction_terra <- as(prediction,"SpatRaster")
  
  # erste Visualisierung der Klassifikation:
  #plot(prediction_terra)
  
  # und nochmal in schöner plotten mit sinnvollen Farben
  cols <- c( "lightgreen","blue", "green","darkred","forestgreen",
             "darkgreen","beige","darkblue"," firebrick1","red","yellow")
  #plot(prediction_terra,col=cols)
  
  # export raster
  #writeRaster(prediction_terra,"prediction.grd",overwrite=TRUE)
  return (plot(prediction_terra))#,col=cols))
}


## Ausgabe
klassifizierung_ohne_Modell = function(rasterdaten, trainingsdaten) {
  
  ##Variablen definieren
  predictors <- c("B02","B03","B04","B08","B05","B06","B07","B11",
                  "B12","B8A")
  
  # Trainingsdaten umprojizieren, falls die Daten verschiedene CRS haben
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))
  
  # Daten mergen
  extr <<- extract(rasterdaten,trainingsdaten)
  #head(extr)
  #head(trainingsdaten)
  trainingsdaten$PolyID <- 1:nrow(trainingsdaten) 
  extr <<- merge(extr,trainingsdaten,by.x="ID",by.y="PolyID")
  #head(extr)
  
  
  # Modell trainieren
  #nicht alle Daten verwenden um Rechenzeit zu sparen
  extr_subset <- extr[createDataPartition(extr$ID,p=0.2)$Resample1,]
  
  #eventuell Daten limitieren.
  #Verhälnis der Daten aus jedem Trainingsgebiet soll aber gleich bleiben
  # hier:10% aus jedem Trainingsgebiet (see ?createDataPartition)
  trainIDs <- createDataPartition(extr$ID,p=0.1,list = FALSE)
  trainDat <- extr[trainIDs,]
  #Sicherstellen das kein NA in Prädiktoren enthalten ist:
  trainDat <- trainDat[complete.cases(trainDat[,predictors]),]
  
  
  #### Modelltraining
  model <- train(trainDat[,predictors],
                 trainDat$Label,
                 method="rf",
                 importance=TRUE,
                 ntree=50) # 50 is quite small (default=500). But it runs faster.
  #saveRDS(model, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/RFModel2.RDS")
  
  #model
  #plot(model) # see tuning results
  #plot(varImp(model)) # variablenwichtigkeit
  
  #klassifizieren
  ###little detour due to terra/raster change
  prediction <- predict(as(rasterdaten,"Raster"),model)
  prediction_terra <- as(prediction,"SpatRaster")
  
  # erste Visualisierung der Klassifikation:
  #plot(prediction_terra)
  
  # und nochmal in schöner plotten mit sinnvollen Farben
  cols <- c( "lightgreen","blue", "green","darkred","forestgreen",
             "darkgreen","beige","darkblue"," firebrick1","red","yellow")
  #plot(prediction_terra,col=cols)
  
  # export raster
  #writeRaster(prediction_terra,"prediction.grd",overwrite=TRUE)
  return (plot(prediction_terra))#,col=cols))
}



# zum Testen der Funktionen
klassifizierung_mit_Modell(rasterdaten, modell)
klassifizierung_ohne_Modell(rasterdaten, trainingsdaten)



