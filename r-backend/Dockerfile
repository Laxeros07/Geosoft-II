# Base image https://hub.docker.com/u/rocker/
# FROM rocker/r-base:latest

# ## create directories
# RUN mkdir -p /01_data
# RUN mkdir -p /02_code
# RUN mkdir -p /03_output

## copy files
##COPY /02_code/install_packages.R /02_code/install_packages.R
##COPY /02_code/myScript.R /02_code/myScript.R

## install R-packages (die librarys, die man für r braucht in einer extra file)
## RUN Rscript /02_code/install_packages.R

#https://www.rplumber.io/articles/hosting.html
FROM rstudio/plumber

WORKDIR /usr/src/app

# Copy app code source from our local folder into the docker /usr/src/app working directory
# COPY ./r-backend/plumber.R ./

RUN apt-get update -qq && apt-get install -y libcurl4-openssl-dev \
    libssl-dev \
    libjq-dev \
    libprotobuf-dev \
    protobuf-compiler \
    make \
    libgeos-dev \
    libudunits2-dev \
    libgdal-dev \
    gdal-bin \
    libproj-dev \
    libv8-dev

RUN R -e "install.packages('plumber', dependencies=TRUE)"
RUN R -e "install.packages('terra', dependencies=TRUE)"
RUN R -e "install.packages('sf', dependencies=TRUE)"
RUN R -e "install.packages('caret', dependencies=TRUE)"
RUN R -e "install.packages('raster', dependencies=TRUE)"
RUN R -e "install.packages('RColorBrewer', dependencies=TRUE)"
RUN R -e "install.packages('CAST', dependencies=TRUE)"
RUN R -e "install.packages('cowplot', dependencies=TRUE)"
RUN R -e "install.packages('tidyterra', dependencies=TRUE)"
RUN R -e "install.packages('testthat', dependencies=TRUE)"

COPY ./r-backend/plumber.R ./

EXPOSE 7001
CMD ["plumber.R"]
