// Create header templates here
var element =  document.getElementById('app-header-home');
if (typeof(element) != 'undefined' && element != null)
{
    element.innerHTML = `
    <h1></h1>
    <nav>
    <ul>
    <li><a href="/index.html" class="header">>>home</a></li>
    <li><a href="/portfolio.html" class="header">>>portfolio<\a><li>
    <li><a href="/publications.html" class="header">>>publications&talks</a></li>
    <li><a href="/about.html" class="header">>>about&contact</a></li>
    <li><a href="https://github.com/ericlumsden"><img title='github' alt='github' src="/images/github.png" width="20" height="20" /></a></li>
    <li><a href="https://www.linkedin.com/in/ericlumsden"><img title='LinkedIn' alt="LinkedIn" src="/images/linkedin.png" width="20" height="20" /></a></li>
    <li><a href="https://medium.com/@eric.lumsden"><img title='Medium' alt='Medium' src="/images/medium.png" width="20" height="20" /></a></li>
    <li><a href="https://x.com/lumsden_eric"><img title='twitter' alt="Twitter" src="/images/twitter.png" width="20" height="20" /></a></li>
    </ul>
    </nav>
    `
} else {
    document.getElementById("app-header").innerHTML = `
    <h1>ERIC WILLIAM LUMSDEN</h1>
    <nav>
    <ul>
    <li><a href="/index.html" class="header">>>home</a></li>
    <li><a href="/portfolio.html" class="header">>>portfolio<\a><li>
    <li><a href="/publications.html" class="header">>>publications&talks</a></li>
    <li><a href="/about.html" class="header">>>about&contact</a></li>
    <li><a href="https://github.com/ericlumsden"><img title='github' alt='github' src="/images/github.png" width="20" height="20" /></a></li>
    <li><a href="https://www.linkedin.com/in/ericlumsden"><img title='LinkedIn' alt="LinkedIn" src="/images/linkedin.png" width="20" height="20" /></a></li>
    <li><a href="https://medium.com/@eric.lumsden"><img title='Medium' alt='Medium' src="/images/medium.png" width="20" height="20" /></a></li>
    <li><a href="https://x.com/lumsden_eric"><img title='twitter' alt="Twitter" src="/images/twitter.png" width="20" height="20" /></a></li>
    </ul>
    </nav>
    `
}

// Create footer templates here (one for main, one for the rest of the pages)
var updated_date = "2024.09.23" // One place to update dates on all pages
document.getElementById("app-footer").innerHTML = `<p>>>EWL   >>Medford, OR   >>Last updated: ${updated_date}</p>`;
