#!/bin/bash
R -e "library(plumber); pr <- plumb('plumber.R'); pr\$run(port=8000)"