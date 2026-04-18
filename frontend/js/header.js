fetch('../components/header.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('header').innerHTML = data;

    // MENU MOBILE
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');

    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });

    
    const links = document.querySelectorAll('.header__nav a');
    const currentPath = window.location.pathname;

    links.forEach(link => {
      const linkPath = link.getAttribute('href');

      if (currentPath.includes(linkPath.replace('..', ''))) {
        link.classList.add('active');
      }
    });
  });