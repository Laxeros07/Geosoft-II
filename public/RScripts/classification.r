### Dieses Skript funktioniert nicht richtig und ist unvollständig
### und liegt hier nur noch als Backup!!!




## librarys installieren
library(terra)
library(sf)
library(caret)
library(raster)

## globale Variablen definieren
predictors <- c(
  "B02", "B03", "B04", "B08", "B05", "B06", "B07", "B11",
  "B12", "B8A"
)
extr <- NULL


## Ausgabe
klassifizierung <- function(rasterdaten, trainingsdaten) {
  return(klassifizieren(rasterdaten, trainingsdaten))
}

## nur zum testen
rasterdaten <- rast("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/sentinelRaster2_umprojiziert.tif")
trainingsdaten <- read_sf("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/trainingsgebiete.geojson")


# Trainingsdaten umprojizieren, falls die Daten verschiedene CRS haben
umprojizieren <- function(rasterdaten, trainingsdaten) {
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))
}

# Daten mergen
zusammenfuegen <- function(rasterdaten, trainingsdaten) {
  umprojizieren(rasterdaten, trainingsdaten)

  extr <<- extract(rasterdaten, trainingsdaten)
  # head(extr)
  # head(trainingsdaten)
  trainingsdaten$PolyID <- 1:nrow(trainingsdaten)
  extr <<- merge(extr, trainingsdaten, by.x = "ID", by.y = "PolyID")
  # head(extr)
}

# Modell trainieren
modelltraining <- function(rasterdaten, trainingsdaten, extr) {
  zusammenfuegen(rasterdaten, trainingsdaten)
  return(extr)
  # nicht alle Daten verwenden um Rechenzeit zu sparen
  extr_subset <- extr[createDataPartition(extr$ID, p = 0.2)$Resample1, ]
  # extr_subset
  # eventuell Daten limitieren.
  # Verhälnis der Daten aus jedem Trainingsgebiet soll aber gleich bleiben
  # hier:10% aus jedem Trainingsgebiet (see ?createDataPartition)
  trainIDs <- createDataPartition(extr$ID, p = 0.1, list = FALSE)
  trainDat <- extr[trainIDs, ]
  # head(trainDat)
  # Sicherstellen das kein NA in Prädiktoren enthalten ist:
  trainDat <- trainDat[complete.cases(trainDat[, predictors]), ]


  #### Modelltraining
  # extr_subset
  model <- train(extr_subset[, predictors],
    extr_subset$Label,
    method = "rf",
    importance = TRUE,
    ntree = 50
  ) # 50 is quite small (default=500). But it runs faster.

  # model
  # plot(model) # see tuning results
  # plot(varImp(model)) # variablenwichtigkeit
}

klassifizieren <- function(rasterdaten, trainingsdaten) {
  modelltraining(rasterdaten, trainingsdaten)

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
  plot(prediction_terra) # ,col=cols)

  # export raster
  writeRaster(prediction_terra, "prediction.grd", overwrite = TRUE)
}


durchfuehrung <- function(x) {
  umprojizieren(rasterdaten, trainingsdaten)
  zusammenfuegen(rasterdaten, trainingsdaten)
  modelltraining(rasterdaten, trainingsdaten, extr)
  klassifizierung(rasterdaten, trainingsdaten)
}
