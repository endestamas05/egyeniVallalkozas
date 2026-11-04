/* A <head>-ben, defer nélkül fut: kiteszi a .js osztályt.
   A görgetésre megjelenő elemek rejtett állapota csak ezzel az osztállyal él,
   így ha a script nem tölt be, minden tartalom látszik. */
document.documentElement.classList.add("js");

/* Keretbe töltés elleni részleges védelem (GitHub Pages-en nem küldhetünk
   frame-ancestors fejlécet). Ha az oldalt más oldal iframe-be tölti, a
   .framed osztály elrejti a tartalmat. A top.location átírását szándékosan
   kerüljük: a böngésző letilthatja, és a hiba a többi scriptet is megállítaná. */
if (window.top !== window.self) {
  document.documentElement.classList.add("framed");
}
