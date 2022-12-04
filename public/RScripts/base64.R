
library(base64)
library(terra)
library(rstudioapi)
library(daiR)

x = function(){
  rawcon <- rawConnection(raw(), "w")
  decode(b64, rawcon)
  output <- rawConnectionValue(rawcon)
  close(rawcon)
  output
  
  # setwd("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/temporaererDatenspeicher")
  # cat(image, file="base.txt")
  # decode("base.txt", "output.tif")
  # tif <- rast("output.tif")
  # png("sentinel.png")
  # plotRGB(tif, b=3, g=2, r=1, stretch="lin")
  # dev.off()
  # return ("hallo")
  
}

# library(readr)
# mystring <- read_file("tmp.txt")
# image <- mystring
# cat(image, file="base.txt")
# decode("base.txt", "output.tif")
# tif <- rast("output.tif")
# png("sentinel.png")
# plotRGB(tif, b=3, g=2, r=1, stretch="lin")
# dev.off()
# 
# x(mystring)
# 
# 
# setwd("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/beispieldaten")
# 
# mybase64 <- "data:image/tiff;base64,SUkqAAgAAAASAAABAwABAAAAtAIAAAEBAwABAAAAjQMAAAIBAwAKAAAA5gAAAAMBAwABAAAAAQAAAAYBAwABAAAAAQAAABEBBACNAwAAFAgAABUBAwABAAAACgAAABYBAwABAAAAAQAAABcBAwCNAwAA+gAAABwBAwABAAAAAQAAAFIBAwAJAAAASBYAAFMBAwAKAAAAWhYAAA6DDAADAAAANhkAAIKEDAAGAAAAThkAAK+HAwAgAAAAfhkAALGHAgAeAAAAvhkAAICkAgDIAgAAbhYAAIGkAgAEAAAAbmFuAAAAAAAgACAAIAAgACAAIAAgACAAIAAgACBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsIGwgbCBsI…"
# 
# raw <- base64enc::base64decode(what = substr(mybase64, 23, nchar(mybase64)))
# png::writePNG(png::readPNG(raw), "mypng.tif")
# 
# b64 <- img_to_binbase("sentinelRaster2.tif")
# raw <- base64enc::base64decode(what = substr(b64, 23, nchar(b64)))
# png::writePNG(png::readPNG(raw), "mypng.png")
# 
# 
# f = system.file("examples", "sentinelRaster2.tif", package = "RCurl")
# img = readBin(f, "raw", file.info(f)[1, "size"])
# enc = base64Encode("sentinelRaster2.tif", "character")
# dec = base64Decode(b64, "raw")
# identical("sentinelRaster2.tif", dec)
# 
# # encode a file
# myfile <- "sentinelRaster2.tif"
# encode(myfile, "tmp.txt")
# # decode it back
# decode("base64.txt", "output.tif")
# test <- rast(tif)
# plotRGB(test, b=3, g=2, r=1, stretch="lin")
# 
# 
# png("test.png")
# plotRGB(test, b=3, g=2, r=1, stretch="lin",maxcell=ncell(test))
# dev.off()
# 
# 
# 
# x(b64)
# image <- b64
# 
# setwd("D:/Dokumente/Studium/5 FS/Geosoftware II/geosoft-II/public/temporaererDatenspeicher")
# cat(image, file="base.txt")
# decode("base.txt", "output.tif")
# tif <- rast("output.tif")
# png("sentinel.png")
# plotRGB(tif, b=3, g=2, r=1, stretch="lin")
# dev.off()
# 
# 
# 
# myfile <- "../beispieldaten/sentinelRaster2.tif"
# encode(myfile, "base.txt")
