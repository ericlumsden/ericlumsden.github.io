#!/usr/bin/perl
use strict;
use warnings;

my @blogs = `find -name "*.md" | grep -o -P '(?<=/).*(?=.md)'`;
my @sites = `find -name "*.html" | grep -o -P '(?<=/).*(?=.html)'`;

my $readme = "README\n";
my @new = ();
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
  if ($count eq 0) {
    chomp($n);
    push(@new, $n);
    my @cmd = ("pandoc", $n.".md", "-s", "-o", $n.".html");
    system(@cmd);
    my @input = ("sed", "-i", "26i <br\><li\><a class="post" href=\"".$n.".html\"\>".$n."</a></li\><br\>", "blog.html");
    system(@input);
    my @css = ("sed", "-i", "/<head>/a <link rel=\"stylesheet\" href=\"../styles.css\"\>", $n.".html");
    system(@css);
    my @bloglink = ("sed", "-i", "/<body>/a <h1>Eric William Lumsden</h1> <ul> <li><a href=\"../index.html\"\>home</a></li> <li><a href=\"../about.html\"\>about</a></li> <li><a href=\"../publications.html\"\>publications</a></li> <li><a href=\"blog.html\"\>blog</a></li> <li><a href=\"../contact.html\"\>contact</a></li></ul><br><br><br>", $n.".html");
    system(@bloglink);
  }
}
