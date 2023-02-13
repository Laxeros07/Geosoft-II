# plumber.R

#* Echo the parameter that was sent in
#* @param msg The message to echo back.
#* @get /echo
function(msg = "") {
  list(msg = paste0("The message is: '", msg, "'"))
}


#* function to test if r functions in plumber work
#* @return string, if everything has worked well
Testfunktion  <- function(){
  library(testthat)
  hallo <- "bla bla"
  return("hat geklappt")}

# Test the function
test_that('teste Testfunktion', {expect_identical(Testfunktion(), "hat geklappt")})



#* Convert Geopackage to GeoJSON
#* @get /convert
#* @serializer json
function() {
  library(sf)
  data <- st_read("myfiles/trainingsdaten.gpkg")
  st_write(data, "myfiles/trainingsdaten.geojson", delete_dsn = TRUE)
}

#* classification without Model
#* Function to calculate a classifikation and depending AOA by using trainingdata
#* @param ymin,ymax,xmin,xmax If provided, cutting for the rasterdata
#* @param baumAnzahl If provided, number of trees for the random forest algorithm
#* @param baumTiefe If provided, depth of the trees for the random forest algorithm
#* @param datenanteil If provided, amount of trainingdata to use for the model calculation
#* @get /result
#* @serializer png
function(ymin = NA, ymax = NA, xmin = NA, xmax = NA, baumAnzahl = NA, baumTiefe = NA, algorithmus = NA, datenanteil = NA) {
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

  ## define variables
  predictors <- names(rasterdaten)

  # reproject traindata if different crs
  trainingsdaten <- st_transform(trainingsdaten, crs(rasterdaten))

  # cut data to provided mask
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

  # merge data
  extr <<- extract(rasterdaten, trainingsdaten)
  trainingsdaten$PolyID <- 1:nrow(trainingsdaten)
  extr <<- merge(extr, trainingsdaten, by.x = "ID", by.y = "PolyID")


  # use less amount of data for faster calculation
  extr_subset <- extr[createDataPartition(extr$ID, p = datenanteil)$Resample1, ]
  trainIDs <- createDataPartition(extr$ID, p = datenanteil, list = FALSE)
  trainDat <- extr[trainIDs, ]
  trainDat <- trainDat[complete.cases(trainDat[, predictors]), ]

  #train Model
  if (algorithmus == "rf") {
    # queryhHyperparameter for model training
    if (is.na(baumAnzahl)) {
      baumAnzahl <- 50 # 50 is quite small (default=500). But it runs faster.
    }
    class(baumAnzahl) <- "numeric"

    if (is.na(baumTiefe)) {
      baumTiefe <- 100
    }
    class(baumTiefe) <- "numeric"

    #### Modeltraining
    model <- train(trainDat[, predictors],
      trainDat$Label,
      method = "rf",
      importance = TRUE,
      ntree = baumAnzahl,
      maxnodes = baumTiefe
    )
  } else {
    model <- train(trainDat[, predictors],
      trainDat$Label,
      method = "rpart",
      trControl = trainControl(method = "cv") # Classification Tree Algorithmus
    ) # not so good like rf Algorithmus
  }
  saveRDS(model, "myfiles/RFModel2.RDS")

  # classification
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), model)
  projection(prediction) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  
  # create suitable color table for color blind people
  farben1 <- brewer.pal(n = 12, name = "Paired")
  farben2 <- brewer.pal(n = 8, name = "Set2")
  farben3 <- brewer.pal(n = 8, name = "Dark2")
  farben <- c(farben1, farben2, farben3)
  test <- as.polygons(prediction_terra)
  neueFarben <-c("#000000")
  index <- 1
  alle <- as.data.frame(levels(prediction_terra))
  for(i in 1:length(alle$value)){
    if(!(alle$value[i] %in% values(test)$layer)){
      neueFarben <- c(neueFarben, "#000000")
    } else {
        neueFarben <- c(neueFarben, farben[index])
        index <- index+1
      }
    }
  coltab(prediction_terra) <- neueFarben

  # export classification
  terra::writeRaster(prediction_terra, "myfiles/prediction.tif", overwrite = TRUE)

  # export classification legend
  legend_plot <- ggplot() +
    geom_spatraster(data = prediction_terra) +
    scale_fill_manual(values = farben[1:12], na.value = NA)
  legend <- get_legend(legend_plot)

  ggsave("myfiles/legend.png", plot = legend, width = 1.7, height = 2.7)

  # query, if an AOA was calculated before
  AOA_Differenz_nötig <- FALSE
  if (file.exists("myfiles/AOA_klassifikation.tif")) {
    AOA_Differenz_nötig <- TRUE
    AOA_klassifikation_alt <- rast("myfiles/AOA_klassifikation.tif")
    terra::writeRaster(AOA_klassifikation_alt, "myfiles/AOA_klassifikation_alt.tif", overwrite = TRUE)
    AOA_klassifikation_alt <- rast("myfiles/AOA_klassifikation_alt.tif")
  }

  # calculate AOA
  AOA_klassifikation <- aoa(rasterdaten, model)
  crs(AOA_klassifikation$AOA) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  crs(AOA_klassifikation$DI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeRaster(AOA_klassifikation$AOA, "myfiles/AOA_klassifikation.tif", overwrite = TRUE)

  # calculate DI
  maxDI <- selectHighest(AOA_klassifikation$DI, 3000)
  crs(maxDI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # terra::writeRaster(maxDI, "myfiles/maxDI.tif", overwrite = TRUE)

  # export DI as GeoJSON
  maxDIVector <- as.polygons(maxDI)
  crs(maxDIVector) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeVector(maxDIVector, "myfiles/maxDI.geojson", filetype = "geojson", overwrite = TRUE)

  # calculate AOA difference
  if (AOA_Differenz_nötig == TRUE) {
    AOA_klassifikation_alt <- crop(AOA_klassifikation_alt, ext(AOA_klassifikation$AOA))
    AOA_klassifikation$AOA <- crop(AOA_klassifikation$AOA, ext(AOA_klassifikation_alt))
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, "myfiles/AOADifferenz.tif", overwrite = TRUE)
  } # 1=Verbesserung der AOA; 0=keine Veränderung; -1=Verschlechterung der AOA
}

#* classification with Model
#* Function to calculate a classifikation and depending AOA by using a RDS model
#* @param ymin,ymax,xmin,xmax If provided, cutting for the rasterdata
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
  class(maske_raster) <- "numeric"

  rasterdaten <- rast("myfiles/rasterdaten.tif")
  modell <- readRDS("myfiles/modell.RDS")

  # cut data to mask
  if (!(is.na(ymin) || is.na(ymax) || is.na(xmin) || is.na(xmax))) {
    rasterdaten <- crop(rasterdaten, ext(maske_raster))
  }

  # classify
  ### little detour due to terra/raster change
  prediction <- predict(as(rasterdaten, "Raster"), modell)
  projection(prediction) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  prediction_terra <- as(prediction, "SpatRaster")
  
  # create suitable color table for color blind people
  farben1 <- brewer.pal(n = 12, name = "Paired")
  farben2 <- brewer.pal(n = 8, name = "Set2")
  farben3 <- brewer.pal(n = 8, name = "Dark2")
  farben <- c(farben1, farben2, farben3)
  test <- as.polygons(prediction_terra)
  neueFarben <-c("#000000")
  index <- 1
  alle <- as.data.frame(levels(prediction_terra))
  for(i in 1:length(alle$value)){
    if(!(alle$value[i] %in% values(test)$layer)){
      neueFarben <- c(neueFarben, "#000000")
    } else {
        neueFarben <- c(neueFarben, farben[index])
        index <- index+1
      }
    }
  coltab(prediction_terra) <- neueFarben

  # export classification
  terra::writeRaster(prediction_terra, "myfiles/prediction.tif", overwrite = TRUE)

  # export calssification legend
  legend_plot <- ggplot() +
    geom_spatraster(data = prediction_terra) +
    scale_fill_manual(values = farben[2:12], na.value = NA)
  legend <- get_legend(legend_plot)

  ggsave("myfiles/legend.png", plot = legend, width = 1.7, height = 2.7)

  # query, if an AOA was calculated before
  AOA_Differenz_nötig <- FALSE
  if (file.exists("myfiles/AOA_klassifikation.tif")) {
    AOA_Differenz_nötig <- TRUE
    AOA_klassifikation_alt <- rast("myfiles/AOA_klassifikation.tif")
    terra::writeRaster(AOA_klassifikation_alt, "myfiles/AOA_klassifikation_alt.tif", overwrite = TRUE)
    AOA_klassifikation_alt <- rast("myfiles/AOA_klassifikation_alt.tif")
  }

  # calculate AOA
  AOA_klassifikation <- aoa(rasterdaten, modell)
  crs(AOA_klassifikation$AOA) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  crs(AOA_klassifikation$DI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # plot(AOA_klassifikation$DI)
  # plot(AOA_klassifikation$AOA)
  terra::writeRaster(AOA_klassifikation$AOA, "myfiles/AOA_klassifikation.tif", overwrite = TRUE)

  # calculate DI
  maxDI <- selectHighest(AOA_klassifikation$DI, 3000)
  crs(maxDI) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  # terra::writeRaster(maxDI, "myfiles/maxDI.tif", overwrite = TRUE)

  # export DI in GeoJSON format
  maxDIVector <- as.polygons(maxDI)
  crs(maxDIVector) <- "+proj=longlat +datum=WGS84 +no_defs +type=crs"
  terra::writeVector(maxDIVector, "myfiles/maxDI.geojson", filetype = "geojson", overwrite = TRUE)

  # calculate AOA difference
  if (AOA_Differenz_nötig == TRUE) {
    AOA_klassifikation_alt <- crop(AOA_klassifikation_alt, ext(AOA_klassifikation$AOA))
    AOA_klassifikation$AOA <- crop(AOA_klassifikation$AOA, ext(AOA_klassifikation_alt))
    differenz <- AOA_klassifikation$AOA - AOA_klassifikation_alt
    terra::writeRaster(differenz, "myfiles/AOADifferenz.tif", overwrite = TRUE)
  } # 1=Verbesserung der AOA; 0=keine Veränderung; -1=Verschlechterung der AOA
}

# root <- pr("plumber.R")
# root

# root %>% pr_run()
