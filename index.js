// Create header templates here
document.getElementById("app-header").innerHTML = `
<h1>Eric William Lumsden</h1>
<ul>
<li><a href="index.html" class="header">home</a></li>
<li><a href="about.html" class="header">about</a></li>
<li><a href="publications.html" class="header">publications</a></li>
<li><a href="./blog/blog.html" class="header">blog</a></li>
<li><a href="contact.html" class="header">contact</a></li>
<li><a href="https://github.com/ericlumsden"><img title='github' alt='github' src="./images/github.png" width="15" height="15" /></a></li>
<li><a href="https://medium.com/@eric.lumsden"><img title='Medium' alt='Medium' src="./images/medium.png" width="15" height="15" /></a></li>
<li><a href="https://twitter.com/lumsden_eric"><img title='twitter' alt="Twitter" src="./images/twitter.png" width="15" height="15" /></a></li>
<li><a href="https://www.linkedin.com/in/ericlumsden"><img title='LinkedIn' alt="LinkedIn" src="./images/linkedin.png" width="15" height="15" /></a></li>
</ul>
`;

// Create footer templates here (one for main, one for the rest of the pages)
var updated_date = "2022.07.09" // One place to update dates on all pages
document.getElementById("app-footer").innerHTML = `<p>Eric William Lumsden | Seattle, WA | Last updated: ${updated_date}</p>`;