# In R
library(sf)
x = function(epsg, bbox){
  p1 = st_point(bbox[1:2])
  p2 = st_point(bbox[3:4])
  sfc = st_sfc(p1, p2, crs = epsg)
  ergebnis <- st_transform(sfc, 4326)
  return(c(ergebnis[[1]][1:1], 
          ergebnis[[1]][2:2],
          ergebnis[[2]][1:1],
          ergebnis[[2]][2:2]))
}
