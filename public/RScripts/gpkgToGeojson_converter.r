library(sf)

konvertierung = function(x) {
  data <- st_read(paste(getwd(),"/public/uploads/trainingsdaten.gpkg",sep=""))
  st_write(data, paste(getwd(),"/public/uploads/trainingsdaten.geojson",sep=""), delete_dsn=TRUE)
}
