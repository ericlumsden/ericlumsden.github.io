# Forecasting the 2023 NCAA Basketball Tournaments
## i. Data Collection
#### March 12, 2023

I don't watch college basketball. I didn't watch college basketball when I was *in* college. For some reason I still fill out a March Madness bracket every single year, picking upsets and major victories I'm convinced will happen off of nothing more than name recognition and small rooting interests. Once my picks are in I suddenly become a fan, an interested party, an expert. As games in the tournament unfold, however, my sacrosanct selections prove shaky, my once-undefeatable chosen teams now incredibly defeatable.

There are ways in which I could become better at making my selections, each option having obvious benefits and drawbacks. *Effective but time consuming*: I could watch games religiously, garnering team tendencies and tricks through the keen eye of a basketball savant, but who has time for that? *Easy but I would literally rather not play at all than watch sports talk/debate shows*: I could watch experts make their selections on any of a number of sports channels/websites/blogs but my eyes would fall out of my head as I would be constantly rolling them. *Salmon swim against the current*: George Costanza piloted ['doing the opposite'](https://www.youtube.com/watch?v=CizwH_T7pjg) and simply picking the opposite of who I want to select in each matchup almost certainly can't be worse than how my typical predictions pan out but I'm a big enough *Seinfeld* fan to know that while it's one thing to laugh at George's antics, it's a completely different can of worms emulating him. Honestly, none of these actually seem viable. My preferred route, the nerd route, would be to use statistics and machine learning to help in my selections and one online competition is giving me motivation to do just that.

Kaggle is once again hosting it's [March Machine Learning Mania competition](https://www.kaggle.com/competitions/march-machine-learning-mania-2023/overview/description) and I decided to submit an entry this year. It provides a good opportunity to try out some ML techniques I've been learning while adding some potential prize money to the fun and if my alma mater taught me anything it's that [you can't go wrong mixing money with college basketball](https://en.wikipedia.org/wiki/1978%E2%80%9379_Boston_College_basketball_point-shaving_scandal). 

The competition evaluates the ability of an individual to predict the probability of one team winning a game over the other using whatever modeling approaches they want. There are no rules regarding how predictions are made, just simply that competitors follow their formatting and submit before the tournament begins. I will be detailing my approach through a series of blog posts, starting with my data collection process.

#### Where's the fun in that?

My plan for the predictor is to compare rate-based season stats for teams competing against each other, which will be fed into a neural network (NN) to predict probability of team 1 beating team 2, based on outcomes from the matchups in that season's tournament. I therefore need to collect two things: **i.** outcomes of every game for every tournament (since 1985 for Men - first tournament that went to 64+ teams; since 2010 for Women - sports-reference page limitations I will detail later) and **ii.** rate data for every team that competed in that tournament. While part of Kaggle's setup provides each competitor with a ton of data going back to the 1984-85 season (including historical tournament seeds, scores from the regular season and conference and NCAA tournaments as well as season-level details such as dates and region names), I am interested in collecting this data myself. I want control over how my data is laid out for analysis, plus I think it's more fun than just taking their data and throwing it into a predictor. Luckily all of the information that I plan to use for my model is available through [sports-reference's college basketball site](https://www.sports-reference.com/cbb/). They have scores from all of the previous tournaments as well as season statistics for every team, laid out in either per game or cumulative bases. All I have to do is collect that data from their website.

One of the easiest ways that I know of for web scraping is using the javascript library [puppeteer](https://pptr.dev/). Puppeteer is a headless browser that allows you access to all of a website's content and you can easily grab information from a page with just a few lines of code. I'll also be saving my data as tables in a SQL database, so I will need to install both the puppeteer library and [sqlite3 module](https://www.npmjs.com/package/sqlite3) for javascript before beginning. I use nodejs as my Javascript runtime environment and the package manager which is used to install javascript modules in nodejs is npm.

```bash
:~/ncaa$ npm install puppeteer sqlite3
```

I will start by making two separate 'scrapers' - one for gathering tournament data and one to gather team data. Tables with this data will be saved in one database. Let's initiate those files now.

```bash
:~/ncaa$ touch scraper_brackets.js scraper_team_stats.js ncaa.db
```

With packages installed and files initiated data collection can actually begin.

#### Setting up puppeteer and sqlite3

The NCAA tournament pages on the sports-reference website have embedded advertisement videos that can really slow down puppeteer, so it would be advantageous to use the puppeteer-extra Adblocker plugin.

```javascript
const puppeteer = require('puppeteer-extra');
const { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } = require('puppeteer');
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker;);
puppeteer.use(
    AdblockerPlugin({
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY
    })
);
```

The sqlite3 module requires a read/write connection with an established database. I like having some confirmation that a successful connection has been established with sqlite3, so I will feed an error printing function into the connection constant that will confirm a connection if there is not error.

```javascript
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./ncaa.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) return console.error(err.message);
    console.log("db connection successful");
});
```

Now, db can be used to create and insert data into tables in the ncaa database.

#### Dance, puppeteer, dance

I will start with a function that takes in a `year` variable and saves the outcome from every game in that year's tournament. This function has to be an `async` function to allow for `await` calls, since many aspects of the function rely on actions happening sequentially.

First step: Create a table for the men's tournament results if one doesn't exist as well as a SQL script for inserting data into that table.

```javascript
async function scrapeTourney(year) {
    db.run(
        `CREATE TABLE IF NOT EXISTS menstourney (year, bracket, round, game, team_1, team_1ID, score_1, url_1, team_2, team_2ID, score_2, url_2, winner)`
    );
    const sql_tourney = `INSERT INTO menstourney (year, bracket, round, game, team_1, team_1ID, score_1, url_1, team_2, team_2ID, score_2, url_2, winner) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`;
```

To lookup the year's tournament with puppeteer, I will first launch puppeteer without its headless option. Sports-reference catches multiple calls to their website and spits back errors when trying to load pages over and over in a headless browser, so the `headless: false` call will avoid those errors. Additionally, I will wait for the page to fully load before attempting to gather any data by calling `waitUntil: 'networkidle0'` in the `page.goto()` function. 

```javascript
    let url = `https://www.sports-reference.com/cbb/postseason/men/${year}-ncaa.html`;
    let browser = await puppeteer.launch({headless: false});
    let page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    await page.goto(url, {waitUntil: 'networkidle0',});
```

The tournament pages are set-up as a series of divs that I will have to iterate over to grab all team names, scores and hyperlinks to the stats page for each team in that year. Luckily, the divisions, rounds, games and teams are all in their own divs, so some nested for-loops will take care of that; however, different brackets have a different number of rounds and there are differing numbers of games per round.

To tackle the number of games per round in each bracket I will take a quick aside to write a simple function. In a division with 4 rounds, there are initially 8 games for 16 teams with the number of games being divided in half with each round. In the final four there are only 4 games initially and half that in the second/last round.

```javascript
const num_brackets = 5; // 4 division plus final four, indexed starting at 1
function find_num_games(bracket, round) {
    if (bracket < num_brackets) {
        return (8 / (2**(round-1)));
    } else {
        return (2 / (2**(round-1)));
    }
}
```

One quick editing note: you'll notice that in the `find_num_games` function the call involves `(round-1)` - the divs on the webpage are indexed starting at 1, so I will write all calls starting at an index of 1; therefore, I must subtract one from the exponent of two to generate the correct denominator.

Determining the number of rounds is easier as it is simply tied to which division I'm iterating over, so that can be written into the body of the `scrapeTourney` function, continued below with the nested for-loops I mentioned above.

```javascript
    try {
        for (let bracket = 1; bracket <= num_brackets; bracket++) {
            // Number of rounds depends on which bracket we're in...
            let num_rounds;
            if (bracket === num_brackets) {
                num_rounds = 2;
            } else {
                num_rounds = 4;
            }

            for (let round = 1; round <= num_rounds; round++) {
                // Number of games in the round is dependent on both bracket and round
                // See above function for how we calculate number of games in the round
                let num_games = find_num_games(bracket, round);

                for (let game = 1; game <= num_games; game++) {
```

Upon reaching the correct game, I will then initiate a series of variables to store the data to be inserted into the menstourney table in the ncaa database, then I will iterate over each team in the game, collect team name and href at one XPath and their game score in another.

Gathering data from an XPath is simple using puppeteer. First, right-click and 'Inspect' any element on a webpage. This will open the developer tools in your browser, where you can scroll html elements on your visited page. Right-clicking on the html element in the developer tools brings up a menu from which you can select Copy > XPath. To access that element with puppeteer simply set an array equal to `page.$x(XPath)`. Then, text content and links can be retrieved from those elements with `.getProperty()` (see code below).

```javascript
                    let team1, team1ID, score1, url1, team2, team2ID, score2, url2, winner;

                    for (let team = 1; team <= 2; team++) {

                        let [team_name] = await page.$x(`/html/body/div[2]/div[5]/div[3]/div[${bracket}]/div/div[${round}]/div[${game}]/div[${team}]/a[1]`);
                        let name_txt = await team_name.getProperty('textContent');
                        let name_url = await team_name.getProperty('href');

                        // Also need score for the team in the round
                        let [team_score] = await page.$x(`/html/body/div[2]/div[5]/div[3]/div[${bracket}]/div/div[${round}]/div[${game}]/div[${team}]/a[2]`);
                        let score_txt = await team_score.getProperty('textContent');
```

One thing that I will want is a simple team ID for quick-calling each team. I will generate these IDs by taking the year of interest and the team's name, combining those as strings and then removing any whitespace. This ID can then be used in any/all data collection/generation I do moving forward. The function for that is:

```javascript
function generate_id(year, team_name) {
    let id_str = year.toString().concat(team_name);
    return id_str.replace(/\s+/g, '');
}
```

Finally, I will save all collected and generated data into the appropriate variables, generate a `winner` variable by comparing the scores from the two teams in the current game (0 being a team 1 win, 1 being team 2) and then save all of that information to the menstourney table in my ncaa database.

```javascript
                        if (team === 1) {
                            team1 = await name_txt.jsonValue();
                            url1 = await name_url.jsonValue();
                            score1 = await score_txt.jsonValue();
                            team1ID = generate_id(year, team1);
                        } else {
                            team2 = await name_txt.jsonValue();
                            url2 = await name_url.jsonValue();
                            score2 = await score_txt.jsonValue();
                            team2ID = generate_id(year, team2);
                        }
                    }

                    if (score1 > score2) {
                        winner = 0;
                    } else {
                        winner = 1;
                    }
                    await console.log({team1, url1, score1, team2, url2, score2});
                    await db.run(sql_tourney, [year, bracket, round, game, team1, team1ID, score1, url1, team2, team2ID, score2, url2, winner]);
                }
            }
        }
```

Once all of the games have been iterated over and saved, we can close the currently open browser before opening the next one.

```javascript
    } catch (error) {
        console.log(error);
    } finally {
        await browser.close(console.log('browser closed'));
    }
}
```

Since I wrote the scraper to take in a `year`, all that is left to do now is to iterate over all tournaments of interest and perform the scraping for each year; however, due to the COVID-canceled tournament in 2020, I will collect 1985-2019 plus 2021 and 2022. I will establish an array with those years:

```javascript
let years_to_scrape = Array.from(Array(2020-1985).keys(), x => x+1985);
years_to_scrape = years_to_scrape.concat([2021,2022]);
```

Then I will write a function that takes in an array of years, iterates over and runs the `scrapeTourney` function on all of those years before closing the connection to the SQL database. Running that function will gather all of the data I'm interested in!

```javascript
async function scrapeYears(array_of_years) {
    for (let x = 0; x < array_of_years.length; x++) {
        let yr = array_of_years[x];
        console.log(`scraping ${yr} tourney`);
        await scrapeTourney(yr);
    }

    await db.close((err) => {
        if (err) return console.error(err.message);
        console.log('db closed');
    })
}

scrapeYears(years_to_scrape);
```

Gathering data for the Women's tournaments is just as straightforward. I will make a new table for their data (`womenstourney`), change the url to be for their tournaments and change the years to be from 2010 to 2022 (excluding 2019). There is a weird setup sports-reference uses for the Women's tournaments pre-2010 in which their scores are stored in `spans` on the tournament page that I was having trouble accessing. 2010 onward, the setup is similar to that for the Men's tournaments, so I will just gather data from then on.

#### Gathering team stats

Scraping team stats from their websites will be much easier than grabbing tournament data. The urls that must be used in puppeteer are already collected and stored in the ncaa database, so it's a simple matter of iterating through those tables, loading the hyperlinks and grabbing their rate stats off their site. As I have already described setting up and running puppeteer and sqlite3, I won't go into those details again, but here is the basic code structure for reading a SQL table row-by-row.

```javascript
let team_IDs = new Set([]);
async function selectRows(table) {
    db.each(`SELECT * FROM ${table}`, (error, row) => {
        if (error) {
            console.error(error.message);
        }
        //console.log(row['team_1ID']);
        for (let team_num = 1; team_num <= 2; team_num++) {
            let team_id = row[`team_${team_num}ID`]
            if team_IDs.has(`${table}_${team_id}`) {
                continue;
            } else {
                team_IDs.add(`${table}_${team_id}`);
                await find_team_stats(row[`url_${team_num}`]);
            }
        }
    });
}
```

The initial step in this code is to establish a set called `team_IDs`, which I will use to check if a team has already had their stats collected. I then iterate over rows in the  If they have, I will move to the next team in the row (as I am iterating over team numbers within each row). If the team's ID and table is not in the `team_IDs` set, then I will add them and then run the `find_team_stats()` function on that team's url.

The `find_team_stats()` function is one that takes in a team's url and then performs similar scraping functions on that team's season rate stats as we performed on the tournaments above. The primary differences come from the fact that the rate stats are saved in tables, not div elements, but gathering data from tables using puppeteer is still relatively straightforward.