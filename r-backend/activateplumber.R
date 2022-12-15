#
# This is a Plumber API. You can run the API by clicking
# the 'Run API' button above.
#
# Find out more about building APIs with Plumber here:
#
#    https://www.rplumber.io/
#

#* @apiTitle Plumber Example API
#* @apiDescription Plumber example description.

library(plumber)
pr("/plumber.R") %>%
  pr_run(port = 8000)
