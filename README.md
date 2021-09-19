# Causal Support: Modeling Causal Inferences with Visualizations

This repository contains supplemental materials for the IEEE VIS 2021 submission, _Causal Support: Modeling Causal Inferences with Visualizations_.

## Contents

Contents include study planning and analysis scripts, preregistrations, stimulus data shown to participants through our web interface, code used to generate the figures and statistics presented in the paper. Generated files such as images and model fit objects have been omitted due to file size. The interface code used to run our experiments is located in a private subrepository in order to protect database credentials.

experiment1/ - _files pertaining to the planning, analysis, and presentation of findings from our first experiment_
- analysis/
    * AnonymizeData.R: a script uses to anonymize worker ids in our data set
    * e1-anonymous.csv: the full data set that we collected for our first experiment
    * ExploratoryVisualization.Rmd: a markdown document walking through the exploratory visualizations we looked at immediately following data collection
    * ExploratoryVisualization.Rmd: notebook code walking through the exploratory visualizations we looked at immediately following data collection
    * ModelExpansion.Rmd: notebook code walking through the model expansion process for our first experiment (file to large to knit a .html markdown document on the author's machine)
    * Results.html: a supplemental markdown document walking through the results of our first experiment
    * Results.Rmd: notebook code walking through the results of our first experiment
- e1-preregistration.pdf - anonymous copy of the preregistration for our first experiment
- stimuli/ - folder containing stimulus data shown to participants in our first experiment as a .csv file, generated in study-planning.Rmd
- study-planning.html: a markdown document used to plan our first experiment and generate stimulus data
- study-planning.Rmd: notebook code used to plan our first experiment and generate stimulus data

experiment2/ - _files pertaining to the planning, analysis, and presentation of findings from our second experiment_
- analysis/
    * AnonymizeData.R: a script uses to anonymize worker ids in our data set
    * e2-anonymous.csv: the full data set that we collected for our second experiment
    * ExploratoryVisualization.Rmd: a markdown document walking through the exploratory visualizations we looked at immediately following data collection
    * ExploratoryVisualization.Rmd: notebook code walking through the exploratory visualizations we looked at immediately following data collection
    * ModelExpansion.Rmd: notebook code walking through the model expansion process for our second experiment (file to large to knit a .html markdown document on the author's machine)
    * Results.html: a supplemental markdown document walking through the results of our second experiment
    * Results.Rmd: notebook code walking through the results of our second experiment
- e2-preregistration.pdf - anonymous copy of the preregistration for our second experiment
- stimuli/ - folder containing stimulus data shown to participants in our second experiment as a .csv file, generated in study-planning.Rmd
- study-planning.html: a markdown document used to plan our second experiment and generate stimulus data
- study-planning.Rmd: notebook code used to plan our second experiment and generate stimulus data

pilot/ - _files pertaining to the planning and analysis from our pilot experiment_
- analysis/
    * AnonymizeData.R: a script uses to anonymize worker ids in our data set
    * pilot-anonymous.csv: the full data set that we collected for our pilot experiment
    * ExploratoryVisualization.Rmd: a markdown document walking through the exploratory visualizations we looked at immediately following data collection
    * ExploratoryVisualization.Rmd: notebook code walking through the exploratory visualizations we looked at immediately following data collection
    * ModelExpansion.Rmd: notebook code walking through the model expansion process for our pilot experiment (file to large to knit a .html markdown document on the author's machine)
- stimuli/ - folder containing stimulus data shown to participants in our pilot experiment as a .csv file, generated in study-planning.Rmd
- study-planning.html: a markdown document used to plan our pilot experiment and generate stimulus data
- study-planning.Rmd: notebook code used to plan our pilot experiment and generate stimulus data

## Interface

The interface we used to run the experiment is a custom web application hosted on Heroku. Please follow these instructions to play with the interface for our second experiment yourself.

The url for the experiment landing page is https://causal-support.herokuapp.com/0_landing?workerId=dev&assignmentId=test&batch=999&cond=[condition]

You'll need to choose which visualization condition you'd like to see. Type one of the following options to fill in the 'cond' url parameter (e.g., `cond=text`). These will allow you to do the experiment with text tables, icon arrays, bar charts, aggregating bar charts, or cross-filter bar charts, respectively.

- text
- icons
- bars
- aggbars
- filtbars
