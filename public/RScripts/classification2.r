## librarys installieren
library(terra)
library(sf)
library(caret)
library(raster)
library(CAST)
library(cowplot)
library(tidyterra)
library(RColorBrewer)
library(tmap)


# zum testen wd so setzen
setwd("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II")

rasterdaten <- rast(paste(
  getwd(),
  "/public/beispieldaten/rasterdaten.tif",
  sep = ""
))
trainingsdaten <- read_sf(paste(
  getwd(),
  "/public/uploads/trainingsdaten2.geojson",
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
algorithmus <- "dt"
datenanteil <- 0.1

## Ausgabe
klassifizierung_mit_Modell <- function(rasterdaten, modell, maske_raster) {
  
  # Rasterdaten zuschneiden
  rasterdaten <- crop(rasterdaten, maske_raster)
  
  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), modell)
  projection(prediction)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  farben1 <- brewer.pal(n = 12, name = "Paired")
  farben2 <- brewer.pal(n = 12, name = "Set2")
  farben3 <- brewer.pal(n = 12, name = "Dark2")
  farben <- c(farben1, farben2, farben3)
  coltab(prediction_terra) <- farben#[0:10]

  # erste Visualisierung der Klassifikation:
  # plot(prediction_terra)

  # und nochmal in schöner plotten mit sinnvollen Farben
  #cols <- c(
  #  "lightgreen", "blue", "green", "darkred", "forestgreen",
  #  "darkgreen", "beige", "darkblue", " firebrick1", "red", "yellow"
  #)
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
klassifizierung_ohne_Modell <- function(rasterdaten, trainingsdaten, maske_raster, maske_training, baumAnzahl, baumTiefe, algorithmus, datenanteil) {
  ## Variablen definieren
  predictors <- names(rasterdaten)
  
  # Rasterdaten zuschneiden
  rasterdaten <- crop(rasterdaten, maske_raster)
  
  # Trainingsdaten zuschneiden
  class(maske_raster) <- "numeric"
  #class(maske_raster)
  #plot(ext(maske_training))
  sf_use_s2(FALSE)
  trainingsdaten2 <- st_make_valid(trainingsdaten)
  trainingsdaten <- st_crop(trainingsdaten2, ext(maske_training))

  # Trainingsdaten umprojizieren, falls die Daten verschiedene CRS haben
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))

  # Daten mergen
  extr <<- extract(rasterdaten, trainingsdaten)
  # head(extr)
  # head(trainingsdaten)
  trainingsdaten$PolyID <- 1:nrow(trainingsdaten)
  extr <<- merge(extr, trainingsdaten, by.x = "ID", by.y = "PolyID")
   #head(extr)

  # Modell trainieren
  # nicht alle Daten verwenden um Rechenzeit zu sparen
   extr_subset <- extr[createDataPartition(extr$ID, p = datenanteil)$Resample1, ]

  # eventuell Daten limitieren.
  # Verhälnis der Daten aus jedem Trainingsgebiet soll aber gleich bleiben
   trainIDs <- createDataPartition(extr$ID, p = datenanteil, list = FALSE)
   trainDat <- extr[trainIDs, ]
  # Sicherstellen das kein NA in Prädiktoren enthalten ist:
  trainDat <- trainDat[complete.cases(trainDat[, predictors]), ]

  if(algorithmus == "rf") {
    # Hyperparameter für Modelltraining abfragen
    if(is.na(baumAnzahl)){
      baumAnzahl <- 50
    }
    if(is.na(baumTiefe)){
      baumTiefe <- 50
    }
    #### Modelltraining
    model <- train(trainDat[, predictors],
      trainDat$Label,
      method = "rf",
      importance = TRUE,
      ntree = baumAnzahl,  # Anzahl der Bäume
      maxnodes = baumTiefe   # Tiefe der Bäume
    ) # 50 is quite small (default=500). But it runs faster.
  } else {
    #print(algorithmus)
    model <- train(trainDat[, predictors],
                   trainDat$Label,
                   method="rpart"#, 
                   #trControl = trainControl(method = "cv")   # Classification Tree Algorithmus
    ) # nicht so gut wie rf Algorithmus
  }
  #model
   #saveRDS(model, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/uploads/modell.RDS")
  saveRDS(model, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/uploads/modell.RDS")
  #?saveRDS
  # model
  # plot(model) # see tuning results
  # plot(varImp(model)) # variablenwichtigkeit

  # Farbpalette
  #cols <- c(
  #  "beige", "sandybrown",
  #  "blue3", "red", "magenta", "red", "darkgoldenrod", "lightgreen", "blue", "green", "deeppink4", "grey", "chartreuse", "deeppink3",
  #  "deepskyblue4", "forestgreen", "brown", "darkgreen"
  #)
  # klassifizieren
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), model)#, colors(cols))
  projection(prediction)<- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  farben1 <- brewer.pal(n = 12, name = "Paired")
  farben2 <- brewer.pal(n = 8, name = "Set2")
  farben3 <- brewer.pal(n = 8, name = "Dark2")
  farben <- c(farben1, farben2, farben3)
  #?categories
  #levels(prediction_terra)
  #id <- c(1:length(test1))
  #id
  #df <- as.data.frame(id, Label)
  #df
  #levels(prediction_terra) <- testung#as.data.frame(id, Label)
  #values(prediction_terra)
  #prediction_terra
  #coltab(prediction_terra) <- farben#[1:(length(as.data.frame(levels(prediction_terra))$value)+1)]#[0:12]
  #terra::plot(prediction_terra, col=farben[1:12])
  #length(as.data.frame(levels(prediction_terra))$value)
  test <- as.polygons(prediction_terra)
  #Label <- c(values(test)[,1])
  #values(test)
  #testung <- as.data.frame(levels(prediction_terra))
  #trainingsdaten$Label
  #test2 <- sort(trainingsdaten$Label)
  #test2 <- unique(test2)
  #test2
  #Label <- c(Label)
  #Label
  #testung
  #ebenen <- as.data.frame(levels(prediction_terra))
  #ebenen
  #levels(prediction_terra)
  #legend(prediction_terra) <- legend("right", legend=values(test))
  #?legend
  #plot(prediction_terra)
  #farben
  #test1[1]
  neueFarben <-c("#000000")
  #nobreak <- TRUE
  #values(test)$layer
  #alle$value
  index <- 1
  #index
  alle <- as.data.frame(levels(prediction_terra))
  for(i in 1:length(alle$value)){
    if(!(alle$value[i] %in% values(test)$layer)){
      neueFarben <- c(neueFarben, "#000000")
    } else {
        neueFarben <- c(neueFarben, farben[index])
        index <- index+1
      }
    }
  #neueFarben
  coltab(prediction_terra) <- neueFarben
  #plot(test)
  #coltab(prediction_terra)
  #plot(prediction_terra)
  # coltab(prediction_terra)

  # erste Visualisierung der Klassifikation:
  # plot(prediction_terra)

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
  legend_plot <- ggplot(prediction_terra)+
    geom_spatraster(data=prediction_terra)+
    scale_fill_manual(values=farben[1:12], na.value=NA) +
    coord_sf(crs="+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs")
    #scale_fill_manual(values=neueFarben, na.value=NA)
  #legend_plot <- ggplot(prediction_terra)+
  #  geom_map(aes(map_id = hallo$id), map=hallo)+
  #  scale_fill_manual(values=farben[2:12], na.value=NA) +
  #  coord_sf(crs="+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs")
  legend <- get_legend(legend_plot)#, farben)
  #?get_legend
  #?geom_spatraster
  #?ggsave
  #?geom_map
  #ext(prediction_terra)
  #bereich <- as.data.frame(c(ext(prediction_terra)[1],ext(prediction_terra)[2],ext(prediction_terra)[3],ext(prediction_terra)[4]))
  #hallo <- fortify(prediction_terra)
  #hallo
  #colnames(hallo)[3] <- "id"
  #bereich

  ggsave(paste(
    getwd(),
    "/public/uploads/legend.png",
    sep = ""
  ), plot= legend, width = 2, height = 3)
  
  #ggsave(paste(
  #  getwd(),
  #  "/public/uploads/legend_plot.tiff",
  #  sep = ""
  #), plot= prediction_terra)
  
  #plot(legend_plot)
  #plot(prediction_terra)
  #plot(legend)
  #test <- as(map, "SpatRaster")
  # crs(prediction_terra) <- "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
  # map <- tm_shape(prediction_terra,
  #                raster.downsample = FALSE, projection = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs") +
  #  tm_raster(palette = farben,title = "LUC")+
  #  tm_scale_bar(bg.color="white")+
  #  tm_grid(n.x=4,n.y=4,projection="+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs")+
  #  tm_layout(legend.position = c("left","bottom"),
  #            legend.bg.color = "white",
  #            legend.bg.alpha = 0.8)#+
#crs(map) <- "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
#test <- tmap_leaflet(map)
#test
#tmap_format()
#tmap_save(map, paste(
#    getwd(),
#    "/public/uploads/map.tiff",
#    sep = ""
#   ))
  
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
    terra::writeRaster(AOA_klassifikation_alt, paste(
      getwd(),
      "/public/uploads/AOA_klassifikation_alt.tif",
      sep = ""
    ), overwrite = TRUE) # 1=gute AOA; 0=schlechte AOA
    AOA_klassifikation_alt<- rast(paste(
      getwd(),
      "/public/uploads/AOA_klassifikation_alt.tif",
      sep = ""
    ))
  }
#plot(AOA_klassifikation_alt)
#plot(AOA_klassifikation$AOA)
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
  #plot(AOA_klassifikation_alt)
  #plot(AOA_klassifikation$AOA)
  if(AOA_Differenz_nötig == TRUE){
    AOA_klassifikation_alt <- crop(AOA_klassifikation_alt, ext(AOA_klassifikation$AOA))
    AOA_klassifikation$AOA <- crop(AOA_klassifikation$AOA, ext(AOA_klassifikation_alt))
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, paste(
      getwd(),
      "/public/uploads/AOADifferenz.tif",
      sep = ""
    ), overwrite = TRUE)
    #plot(differenz)
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
 klassifizierung_ohne_Modell(rasterdaten, trainingsdaten, maske_raster, maske_training, baumAnzahl, baumTiefe, algorithmus, datenanteil)
 