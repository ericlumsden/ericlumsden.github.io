// Create header templates here
document.getElementById("app-header").innerHTML = `
<h1>Eric William Lumsden</h1>
<ul>
<li><a href="index.html">home</a></li>
<li><a href="about.html">about</a></li>
<li><a href="publications.html">publications</a></li>
<li><a href="./blog/blog.html">blog</a></li>
<li><a href="contact.html">contact</a></li>
<li><a href="https://medium.com/@eric.lumsden"><img title='Medium' alt='Medium' src="./images/medium.png" width="15" height="15" /></a></li>
<li><a href="https://twitter.com/lumsden_eric"><img title='twitter' alt="Twitter" src="./images/twitter.png" width="15" height="15" /></a></li>
<li><a href="https://www.linkedin.com/in/ericlumsden"><img title='LinkedIn' alt="LinkedIn" src="./images/linkedin.png" width="15" height="15" /></a></li>
</ul>
`;

// Create footer templates here (one for main, one for the rest of the pages)
var updated_date = "2022.07.05" // One place to update dates on all pages
document.getElementById("app-footer").innerHTML = `<p>Eric William Lumsden | Seattle, WA | Last updated: ${updated_date}</p>`;
document.getElementById("lucy").innerHTML = '<a id="Lucy"><img class="image_on" alt="Lucy" src="./images/lucy2.png" /><img class="image_off" title="Lucy says hi!" alt="Lucy" src="./images/lucy1.png" /></a>';