library(tidyverse)
library(brms)
library(tidybayes)
library(modelr)

# load data
setwd(dirname(rstudioapi::getSourceEditorContext()$path))
df <- read_csv("pilot-anonymous.csv")

# exclusions
exclude_df <- df %>%
  group_by(workerId) %>%
  summarise(
    max_trial_idx = which(causal_support == max(causal_support)),
    max_trial = trial[[max_trial_idx]],
    max_trial_err = abs_err[[max_trial_idx]],
    min_trial_idx = which(causal_support == min(causal_support)),
    min_trial = trial[[min_trial_idx]],
    min_trial_err = abs_err[[min_trial_idx]],
    exclude = max_trial_err > 0.5 | min_trial_err > 0.5
  )
df = exclude_df %>%
  full_join(df, by = "workerId") %>%
  filter(!exclude) %>%
  group_by(workerId, trial) %>%
  filter(trial != max_trial & trial != min_trial) %>%
  ungroup() %>%
  select(-one_of(c("max_trial_idx", "max_trial", "max_trial_err", "min_trial_idx", "min_trial", "min_trial_err", "exclude"))) 

# set up for modeling
df = df %>%
  # drop practice trial
  filter(trial != "practice") %>%
  mutate(
    # response units
    response_A =  if_else(
      response_A > 99.5, 99.5,
      if_else(
        response_A < 0.5, 0.5,
        as.numeric(response_A))),
    response_B =  if_else(
      response_B > 99.5, 99.5,
      if_else(
        response_B < 0.5, 0.5,
        as.numeric(response_B))),
    lrr = log(response_A / 100) - log(response_B / 100),
    # predictors as factors
    worker = as.factor(workerId),
    vis = as.factor(condition),
    n = as.factor(n),
    # derived predictors
    delta_p = (C + D)/(nC + nD) - (A + B)/(nA + nB)
  ) 

# separate dataframes per vis condition
icons_df <- df %>% filter(condition == "icons")
text_df <- df %>% filter(condition == "text")

# unique workers for each condition
icons_workers <- unique(icons_df$workerId)
text_workers <- unique(text_df$workerId)

# simulate different sample sizes using bootstrap
sample_sizes <- c(100, 80)
results <- rep(0, length(sample_sizes))
total_iters <- 50
iters <- seq(from = 1, to = total_iters, by = 1)

for (i in sample_sizes) {
  for (j in iters) {
    # sample equal number of participants from each condition with replacement
    icons_sampled_df <- icons_df[unlist(lapply(sample(icons_workers, i, replace = TRUE), function (.) { which(icons_df$workerId == .)} )),]
    text_sampled_df <- text_df[unlist(lapply(sample(text_workers, i, replace = TRUE), function (.) { which(text_df$workerId == .)} )),]
    sampled_df <- rbind(icons_sampled_df, text_sampled_df)
    
    # fit minimal-ish model (no random effects)
    m <- brm(data = sampled_df, family = "gaussian",
             formula = bf(lrr ~ causal_support*delta_p*n*vis,
                          sigma ~ abs(causal_support)),
             prior = c(prior(normal(-0.21, 1), class = Intercept),            # center at qlogis(mean(model_df$response_A) / 100)
                       prior(normal(0, 1), class = b),                        # center predictor effects at 0
                       prior(normal(1, 2), class = b, coef = causal_support), # center at unbiased slope
                       prior(normal(0, 1), class = b, dpar = sigma),          # weakly informative half-normal
                       prior(normal(0, 1), class = Intercept, dpar = sigma)), # weakly informative half-normal
             iter = 1500, warmup = 500, chains = 2, cores = 2,
             control = list(adapt_delta = 0.99, max_treedepth = 12),
             file = paste(c("model-fits/power", i, j), collapse = "-"))
    
    # postprocessing
    slopes_df <- sampled_df %>%
      group_by(n, vis) %>%
      data_grid(
        causal_support = c(0, 1),
        delta_p = quantile(sampled_df$delta_p, probs = plogis(seq(from = qlogis(0.001), to = qlogis(0.999), length.out = 20)))) %>%
      add_fitted_draws(m, value = "lrr_rep", seed = 1234, n = 500, re_formula = NA) %>%
      compare_levels(lrr_rep, by = causal_support) %>% # calculate slopes
      group_by(vis, .draw) %>%                         # group by predictors to keep
      summarise(lrr_rep = weighted.mean(lrr_rep)) %>%  # marginalize out delta_p and n effects
      compare_levels(lrr_rep, by = vis) %>%            # calculate difference between vis conds
      rename(slope_diff = lrr_rep)
    
    # accumulate power calculation
    result <- slopes_df %>% median_qi(slope_diff)
    reliable <- sign(result$.upper) == sign(result$.lower)
    results[[which(sample_sizes == i)]] = results[[which(sample_sizes == i)]] + reliable
  }
}

# print out power at each sample size
sample_sizes
results / total_iters


## alternative power analysis (doesn't take as long to run)

# fit model to pilot data after exclusions
m <- brm(data = df, family = "gaussian",
         formula = bf(lrr ~ causal_support*delta_p*n*vis + (causal_support|workerId),
                      sigma ~ abs(causal_support) + (1|workerId)),
         prior = c(prior(normal(-0.21, 1), class = Intercept),              # center at qlogis(mean(model_df$response_A) / 100)
                   prior(normal(0, 0.5), class = b),                        # center predictor effects at 0
                   prior(normal(1, 0.5), class = b, coef = causal_support), # center at unbiased slope
                   prior(normal(0, 0.2), class = b, dpar = sigma),          # weakly informative half-normal
                   prior(normal(0, 0.2), class = Intercept, dpar = sigma),  # weakly informative half-normal
                   prior(normal(0, 0.2), class = sd),                       # weakly informative half-normal
                   prior(lkj(4), class = cor)),                             # avoiding large correlations
         iter = 2000, warmup = 500, chains = 2, cores = 2,
         control = list(adapt_delta = 0.99, max_treedepth = 12),
         file = "model-fits/5b_re-simple_after-exclusions")

# postprocessing
slopes_df <- df %>%
  group_by(n, vis) %>%
  data_grid(
    causal_support = c(0, 1),
    delta_p = quantile(sampled_df$delta_p, probs = plogis(seq(from = qlogis(0.001), to = qlogis(0.999), length.out = 20)))) %>%
  add_fitted_draws(m, value = "lrr_rep", seed = 1234, n = 500, re_formula = NA) %>%
  compare_levels(lrr_rep, by = causal_support) %>% # calculate slopes
  group_by(vis, .draw) %>%                         # group by predictors to keep
  summarise(lrr_rep = weighted.mean(lrr_rep)) %>%  # marginalize out delta_p and n effects
  compare_levels(lrr_rep, by = vis) %>%            # calculate difference between vis conds
  rename(slope_diff = lrr_rep)

# power calculation (assume reliability is proportional to 1 / sqrt(n))
result <- slopes_df %>% median_qi(slope_diff)
(result$.upper - result$.lower) * sqrt(5) / sqrt(40)
(result$.upper - result$.lower) * sqrt(5) / sqrt(50)
(result$.upper - result$.lower) * sqrt(5) / sqrt(60)
(result$.upper - result$.lower) * sqrt(5) / sqrt(70)
(result$.upper - result$.lower) * sqrt(5) / sqrt(80) # probably target this just to be safe (should be able to detect slope_diff of 0.04)
(result$.upper - result$.lower) * sqrt(5) / sqrt(90)
(result$.upper - result$.lower) * sqrt(5) / sqrt(100)
