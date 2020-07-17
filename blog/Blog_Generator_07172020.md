# A Blog Generator using Pandoc, Written in Perl
## July 17, 2020

One thing I was interested in developing for this website was a way to automatically generate blogposts from markdown files. I wanted to write my posts in Markdown because it is easy to read and quick to write. Unfortunately it cannot be published on a website without first being translated to html. Fortunately, that is easily accomplished via any number of software packages. I didn't want to have to upload every blogpost to a converter whenever I had written something, then go in and edit my blog page on my website to include a link to the newest post, so the answer seemed obvious. I needed to write a program that would do three things:

  1.. Convert my *new* markdown files into html.
  2.. Add a link to this new html page onto my blog page.
  3.. Add the appropriate headers/links to my blog posts to make it look like the rest of my website.

I decided to approach this problem in Perl, because of how easy it is to call for system input and run shell commands. I thought that if I could accomplish all three of my goals via calls to the terminal it would not only be a simpler approach but would also help me continue to expand my bash skills. So, the first part of my perl script loads all markdown and html files into two arrays via the terminal.

```Perl
my @blogs = `find -name "*.md" | grep -o -P '(?<=/).*(?=.md)'`;
my @sites = `find -name "*.html" | grep -o -P '(?<=/).*(?=.html)'`;
```

Employing backticks stores the output of the terminal command into the designated variables. Later on, when there is no output to be stored, the system function will be called. Once these arrays have been filled, the program loops through the two arrays and makes comparisons between them. A count variable keeps track of the compared file names to exclude markdown files that had previously been converted to html, avoiding duplicates. If the markdown file has already been converted to html, or the markdown file is the README file (stored in the readme variable), then the counter goes to 1 and the rest of the loop is skipped.

```Perl
foreach my $n (@blogs) {
  my $count = 0;
  if ($n eq $readme) {
    $count = 1;
  }
  foreach my $w (@sites) {
    if ($n eq $w) {
      $count = 1;
    }
  }
}
```

If there is no html file of the same name as the markdown file currently being assessed, then it makes a call to Pandoc, a software converter, to convert the markdown file to html. This call is, once again, handled via the terminal.

```Perl
if ($count eq 0) {
  chomp($n);
  push(@new, $n);
  my @cmd = ("pandoc", $n.".md", "-s", "-o", $n.".html");
  system(@cmd);
}
```
*Voila!* Part one is done, and in only 20ish lines of code. Now, all that is left to do is add a hyperlink to that newly created blogpost in the blog's main page.

```Perl
my @input = ("sed", "-i", "26i <br\><li\><a class="post" href=\"".$n.".html\"\>".$n."</a></li\><br\>", "blog.html");
system(@input);
```

The call to add this line into line 26 is hard coded so that the links will appear chronologically, with the hyperlink to the newest blog post being inserted into the top of the list of posts. Then, both the link to the shared css stylesheet (link placed immediately after the style tag) and the header information (added to the body) are added to the newly created blogpost.

```Perl
my @css = ("sed", "-i", "/<head>/a <link rel=\"stylesheet\" href=\"../styles.css\"\>", $n.".html");
system(@css);
my @bloglink = ("sed", "-i", "/<body>/a <h1>Eric William Lumsden</h1> <ul> <li><a href=\"../index.html\"\>home</a></li> <li><a href=\"../about.html\"\>about</a></li> <li><a href=\"../publications.html\"\>publications</a></li> <li><a href=\"blog.html\"\>blog</a></li> <li><a href=\"../contact.html\"\>contact</a></li></ul><br><br><br>", $n.".html");
system(@bloglink);
```

The styles sheet and all other pages of the website are placed in the folder directly upstream in the hierarchy, so the links to them must be prefaced with a call to that upstream folder (`../`).

That's it. This script sits in my blog directory in my website repository. Now, whenever I create a new blog post with markdown and want to turn translate it to html, I simply navigate to the blog directory and call the program in my terminal using perl.

```console
~/website/blog$ perl blog_generator.pl
```

I hit a number of snags along the way. In my initial attempts to use the variables in my calls to the terminal I did not realize that the newline character was included in those calls (taken care of with `chomp`). I also struggled to get the call to Pandoc working initially, as I was submitting my terminal commands as a string and not a list of commands. Other errors happened along the way as well, but I won't bore you with details.

This was my first project with Perl, and I learned a lot. The flexibility it provides with easy calls to the terminal has me excited for possibilities in future projects. If you want to download the blog generator script and use it yourself you can find it in the blog folder of my website's [github repository](https://github.com/ericlumsden/ericlumsden.github.io) with the file name 'blog_generator.pl'. This script uses Perl v 5.26 and Pandoc v 2.10.
