library(sf)

konvertierung = function(geopackageEingabe) {
  data <- st_read(geopackageEingabe)
  st_write(data, "temporaererDatenspeicher/data.geojson")
  neu <- st_read("temporaererDatenspeicher/data.geojson")
  return (neu)
}
