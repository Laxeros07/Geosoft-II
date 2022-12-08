library(sf)


pfad <- getwd()
pfad





# zum Testen
geopackage <- st_read("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/beispieldaten/trainingsgebiete.gpkg")

konvertierung = function(geopackageEingabe) {
  st_write(geopackageEingabe, "C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/uploads/data.geojson")
  neu <- st_read("C:/Users/Felix/Desktop/Studium/Uni Fächer/4. Semester/Geosoft 1/Geosoft-II/public/uploads/data.geojson")
  return (neu)


# zum Testen
konvertierung(geopackage)
