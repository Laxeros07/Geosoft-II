
library(base64)
library(terra)
x = function(image){
  # cat(image, file="base.txt")
  # decode("base.txt", "output.tif")
  # tif <- rast("output.tif")
  # png("sentinel.png")
  # plotRGB(tif, b=3, g=2, r=1, stretch="lin")
  # dev.off()
  # return ("hallo")
    setwd("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/temporaererDatenspeicher")
    cat(image, file="base.txt")
    return(getwd())
}