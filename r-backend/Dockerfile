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
COPY ./r-backend/plumber.R ./

# RUN R -e "install.packages('broom')"

CMD ["plumber.R"]