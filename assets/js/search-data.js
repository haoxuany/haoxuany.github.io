// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "post-",
      
        title: "",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2026-06-10-johnson/";
        
      },
    },{id: "post-thoughts-on-standard-ml",
      
        title: "Thoughts on Standard ML",
      
      description: "here we go again",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/experimental-sml/";
        
      },
    },{id: "post-how-to-dislike-constructive-mathematics-correctly",
      
        title: "How to Dislike Constructive Mathematics Correctly",
      
      description: "where I attempt to start an Internet flame war",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/dislike-constructive-mathematics/";
        
      },
    },{id: "post-a-hands-on-guide-to-implementing-debruijn-indicies-1",
      
        title: "A Hands-on Guide to Implementing DeBruijn Indicies (1)",
      
      description: "where we talk about debruijn indicies in the simple first order case",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/debruijn-1/";
        
      },
    },{id: "post-first-post",
      
        title: "First Post!",
      
      description: "testing first blog post",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/first-post/";
        
      },
    },{id: "news-started-a-blog-smile",
          title: 'Started a blog. :smile:',
          description: "",
          section: "News",},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%79%75%65%68%61%6F%78%75%61%6E%61%72@%79%61%68%6F%6F.%63%6F%6D.%73%67", "_blank");
        },
      },{
        id: 'social-facebook',
        title: 'Facebook',
        section: 'Socials',
        handler: () => {
          window.open("https://facebook.com/haoxuanyue", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/haoxuany", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
