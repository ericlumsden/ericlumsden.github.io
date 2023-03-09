# Forecasting the 2023 NCAA Basketball Tournaments
## i. Data Collection
#### March 10, 2023

I don't watch college basketball. I didn't watch college basketball when I was *in* college. For some reason, every single year, I still fill out a March Madness bracket, picking upsets and major victories I'm convinced will happen off of nothing more than name recognition and small rooting interests. Once my picks are in I suddenly become a fan, an interested party, an expert. As games in the tournament unfold, however, my sacrosanct selections prove shaky, my once-undefeatable chosen teams now incredibly defeatable.

There are ways in which I could become better at making my selections. I could watch games religiously, garnering team tendencies and tricks through the keen eye of a basketball savant. I could watch experts make their selections on any of a number of sports channels/websites/blogs. Or, I could take my preferred route, the nerd route, and use statistics and machine learning to help in my selections.

Kaggle is once again hosting it's [March Machine Learning Mania competition](https://www.kaggle.com/competitions/march-machine-learning-mania-2023/overview/description) and I decided to submit an entry this year. It provides a good opportunity to try out some ML techniques I've been learning while adding some potential prize money to the fun and if my alma mater taught me anything it's that [you can't go wrong mixing money with college basketball](https://en.wikipedia.org/wiki/1978%E2%80%9379_Boston_College_basketball_point-shaving_scandal). 

The competition evaluates the ability of an individual to predict the probability of one team winning a game over the other using whatever modeling approaches they want. There are no rules regarding how you make your predictions, just simply that you follow their formatting and submit before the tournament begins. I will be detailing my approach through a series of blog posts, starting with my data collection process.

#### Where's the fun in that?

My plan for the predictor is to compare rate-based season stats for the teams competing against each other, which will be fed into a neural network (NN) to predict probability of team 1 beating team 2, based on outcomes from the matchups in that season's tournament. I therefore need to collect two things: i. outcomes of every game for every tournament since 1985 (first tournament that went to 64+ teams) and ii. rate data for every team that competed in that tournament. While part of Kaggle's setup provides each competitor with a ton of data going back to the 1984-85 season (including historical tournament seeds, scores from the regular season and conference and NCAA tournaments as well as season-level details such as dates and region names), I am interested in collecting this data myself. I want control over how my data is laid out for analysis, plus I think it's more fun. Luckily all of the information that I plan to use for my model is available through [sports-reference's college basketball site](https://www.sports-reference.com/cbb/). They have scores from all of the previous tournaments as well as season statistics for every team, laid out in either per game or cumulative bases. All I have to do is collect that data from their website.

One of the easiest ways that I know of for web scraping is using the javascript library [puppeteer](https://pptr.dev/). Puppeteer is a headless browser that allows you access to all of a website's content and you can easily grab information from a page with just a few lines of code. I'll also be saving my data as tables in a SQL database, so I will need to install both the puppeteer library and sqlite3 module for javascript before beginning. I use nodejs as my Javascript runtime environment and the package manager which is used to install javascript modeuls in nodejs is npm.

```bash
~:$ cd /example_directroy/
~:example_directory$ npm install puppeteer, sqlite3
```



#### Dance, puppeteer, dance