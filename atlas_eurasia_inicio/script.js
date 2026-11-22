const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.14 });

revealElements.forEach((element) => revealObserver.observe(element));

const cursorGlow = document.querySelector(".cursor-glow");
const cursorDot = document.querySelector(".cursor-dot");
if (window.matchMedia("(pointer: fine)").matches && cursorGlow && cursorDot) {
  cursorDot.classList.add("visible");
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
    cursorDot.style.left = `${event.clientX}px`;
    cursorDot.style.top = `${event.clientY}px`;
  }, { passive: true });

  document.querySelectorAll("a, button").forEach((element) => {
    element.addEventListener("pointerenter", () => cursorDot.classList.add("is-hover"));
    element.addEventListener("pointerleave", () => cursorDot.classList.remove("is-hover"));
  });
} else {
  cursorGlow?.remove();
  cursorDot?.remove();
}

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");
menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  menuButton.textContent = isOpen ? "×" : "☰";
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    menuButton?.setAttribute("aria-label", "Abrir menú");
    if (menuButton) menuButton.textContent = "☰";
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !nav?.classList.contains("open")) return;
  nav.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  menuButton?.setAttribute("aria-label", "Abrir menú");
  if (menuButton) {
    menuButton.textContent = "☰";
    menuButton.focus();
  }
});

const topbar = document.querySelector(".topbar");
let previousScrollY = window.scrollY;
let scrollTicking = false;
function updateTopbarVisibility() {
  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > previousScrollY + 4;
  const scrollingUp = currentScrollY < previousScrollY - 4;
  const menuHasFocus = topbar?.contains(document.activeElement);

  if (currentScrollY < 120 || scrollingUp || menuHasFocus || nav?.classList.contains("open")) {
    topbar?.classList.remove("is-hidden");
  } else if (scrollingDown) {
    topbar?.classList.add("is-hidden");
  }
  previousScrollY = currentScrollY;
  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateTopbarVisibility);
}, { passive: true });

window.addEventListener("pointermove", (event) => {
  if (event.clientY < 82) topbar?.classList.remove("is-hidden");
}, { passive: true });

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".main-nav a");
const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const activeId = entry.target.id === "relieve-europa"
      ? "europa"
      : entry.target.id === "relieve-asia"
        ? "asia"
        : entry.target.id;
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
    });
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach((section) => activeObserver.observe(section));

const cards = Array.from(document.querySelectorAll(".atlas-card"));
const tabs = Array.from(document.querySelectorAll(".carousel-pagination [data-go]"));
const count = document.querySelector(".carousel-count");
let activeSlide = 0;

function showSlide(index) {
  if (!cards.length) return;
  activeSlide = (index + cards.length) % cards.length;
  cards.forEach((card, cardIndex) => {
    const active = cardIndex === activeSlide;
    card.classList.toggle("is-active", active);
    card.classList.toggle("was-before", cardIndex < activeSlide);
    card.setAttribute("aria-hidden", String(!active));
  });
  tabs.forEach((tab, tabIndex) => {
    tab.setAttribute("aria-selected", String(tabIndex === activeSlide));
  });
  if (count) count.innerHTML = `${String(activeSlide + 1).padStart(2, "0")} <i>/ ${String(cards.length).padStart(2, "0")}</i>`;
}

document.querySelector(".carousel-arrow.previous")?.addEventListener("click", () => showSlide(activeSlide - 1));
document.querySelector(".carousel-arrow.next")?.addEventListener("click", () => showSlide(activeSlide + 1));
tabs.forEach((tab) => tab.addEventListener("click", () => showSlide(Number(tab.dataset.go))));
document.querySelector(".carousel-shell")?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") showSlide(activeSlide + 1);
  if (event.key === "ArrowLeft") showSlide(activeSlide - 1);
});
showSlide(0);

const continentTopics = {
  europa: {
    presentacion: {
      kicker: "01 / PANORAMA",
      title: "Una diversidad a escala continental",
      text: "Europa se extiende desde el Atlántico hasta los Urales. Su tamaño relativamente compacto reúne penínsulas, mares, llanuras y una gran variedad de sociedades.",
      points: ["La frontera con Asia es convencional, no un límite oceánico.", "Las regiones pueden agruparse de distintas maneras según la fuente."]
    },
    relieve: {
      kicker: "02 / RELIEVE Y AGUAS",
      title: "Llanuras, cordilleras y cuencas",
      text: "La Gran Llanura Europea contrasta con sistemas montañosos como los Alpes, Pirineos, Cárpatos y montes Escandinavos. El arco alpino concentra glaciares, valles y divisorias de aguas.",
      points: ["Volga, Danubio y Rin son sistemas fluviales destacados.", "Los Alpes se extienden por ocho países."]
    },
    limites: {
      kicker: "03 / LÍMITES Y PAÍSES",
      title: "Una frontera geográfica convencional",
      text: "Limita con el océano Ártico al norte, el Atlántico al oeste y los mares Mediterráneo y Negro al sur. El borde oriental suele seguir los Urales, el río Ural, el Caspio, el Cáucaso y los estrechos turcos.",
      points: ["La ONU M49 ubica las regiones para fines estadísticos; no define soberanía.", "El recuento de Estados depende del criterio y de los territorios considerados."]
    },
    sociedad: {
      kicker: "04 / SOCIEDAD Y CULTURA",
      title: "Lenguas, migraciones y ciudades",
      text: "En un espacio conectado conviven lenguas de distintas familias, tradiciones locales y grandes áreas urbanas. La movilidad y las migraciones han transformado sociedades a lo largo de los siglos.",
      points: ["Las lenguas urálicas y romances, germánicas y eslavas muestran parte de esa diversidad.", "La cultura europea no es homogénea ni coincide con una sola frontera política."]
    },
    economia: {
      kicker: "05 / ECONOMÍA",
      title: "Redes productivas interdependientes",
      text: "Servicios, manufactura, comercio, turismo, tecnología y agricultura forman economías diversas. Las cadenas de suministro y las redes de transporte enlazan países, pero persisten fuertes diferencias regionales.",
      points: ["La Unión Europea es una organización política y económica de 27 miembros; no representa a toda Europa.", "La transición energética y la productividad son desafíos compartidos."]
    },
    climas: {
      kicker: "06 / CLIMAS",
      title: "Mares, latitud y relieve",
      text: "El oeste atlántico suele ser más templado y húmedo; hacia el este aumenta la amplitud térmica. El sur mediterráneo tiene veranos secos, mientras el norte y las montañas presentan condiciones frías.",
      points: ["Oceánico, continental, mediterráneo, polar/subpolar y de montaña.", "En los mapas siguientes, los grupos Köppen–Geiger representan el periodo 1991–2020."]
    }
  },
  asia: {
    presentacion: {
      kicker: "01 / PANORAMA",
      title: "Escalas continentales, realidades diversas",
      text: "Asia abarca desde el Ártico hasta el Índico y el Pacífico. Sus interiores continentales, penínsulas y archipiélagos producen enormes contrastes físicos y humanos.",
      points: ["Es el continente de mayor superficie y población según las delimitaciones habituales.", "La distribución de población y ciudades es muy desigual."]
    },
    relieve: {
      kicker: "02 / RELIEVE Y AGUAS",
      title: "Altiplanos, grandes ríos y costas",
      text: "La meseta tibetana, el Himalaya y el Karakórum forman algunos de los relieves más elevados del planeta. Hacia el norte se abren las llanuras siberianas; al sur y al este, grandes ríos llegan a mares y océanos.",
      points: ["Yangtsé, Huang He, Ganges, Indo, Mekong, Obi y Lena drenan cuencas muy distintas.", "Monzones, glaciares y deshielo influyen en millones de habitantes."]
    },
    limites: {
      kicker: "03 / LÍMITES Y PAÍSES",
      title: "De los Urales al Pacífico",
      text: "Asia limita con los océanos Ártico, Pacífico e Índico. Hacia Europa se emplean fronteras convencionales —Urales, Caspio y Cáucaso entre ellas— cuya interpretación varía.",
      points: ["La clasificación ONU M49 agrupa países y áreas por conveniencia estadística.", "Los recuentos estatales dependen de la clasificación y del reconocimiento adoptado."]
    },
    sociedad: {
      kicker: "04 / SOCIEDAD Y CULTURA",
      title: "Una pluralidad de pueblos y lenguas",
      text: "Asia contiene cientos de lenguas y tradiciones, además de grandes religiones históricas y sociedades urbanas en rápida transformación. Ninguna descripción única representa por sí sola a todo el continente.",
      points: ["Las familias lingüísticas incluyen, entre otras, las sino-tibetanas, indoeuropeas, túrquicas y austronesias.", "Las ciudades, regiones rurales y comunidades insulares viven realidades distintas."]
    },
    economia: {
      kicker: "05 / ECONOMÍA",
      title: "Producción, servicios y recursos",
      text: "Manufactura, agricultura, energía, tecnología y servicios se combinan de formas diferentes entre Asia oriental, meridional, central, occidental y sudoriental.",
      points: ["Las cadenas industriales y comerciales conectan puertos, ciudades y regiones interiores.", "Los promedios continentales ocultan brechas de ingreso y desarrollo."]
    },
    climas: {
      kicker: "06 / CLIMAS",
      title: "Del Ártico al monzón",
      text: "La enorme extensión latitudinal y los grandes relieves producen desde condiciones polares y desérticas hasta ambientes monzónicos y tropicales; la altitud crea contrastes locales marcados.",
      points: ["Polar, continental, desértico/árido, monzónico, tropical y de montaña.", "Los rangos de las fichas son orientativos; la clasificación cartográfica corresponde a 1991–2020."]
    }
  }
};

const climateZones = {
  europa: [
    { name: "Oceánico", location: "Fachada atlántica e islas británicas", description: "Los vientos del Atlántico suavizan las estaciones: inviernos generalmente frescos y veranos moderados. Llueve durante todo el año, habitualmente unos 600–2.000 mm, con máximos locales en áreas montañosas.", temperature: "Invierno: ~0–8 °C · verano: ~12–20 °C", image: "europe-lyngen-fjord.jpg", alt: "Fiordo de Lyngen en la costa norte de Noruega", credit: "Ximonic (Simo Räsänen) · CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:At_Lyngen_fjord,_Sp%C3%A5kenes_in_2012_June.jpg" },
    { name: "Continental", location: "Europa central y oriental, lejos del Atlántico", description: "La influencia marítima disminuye hacia el interior: los inviernos son más fríos y los veranos más cálidos. La precipitación suele rondar 400–800 mm y concentrarse en la estación cálida, con grandes variaciones regionales.", temperature: "Invierno: ~−10–0 °C · verano: ~18–25 °C", image: "europe-volga-nizhny-novgorod.jpg", alt: "Río Volga y ribera urbana en Nizhni Nóvgorod, Rusia", credit: "Алексей Трефилов · Wikimedia Commons · CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Volga_River_Embankment_in_Nizhny_Novgorod.jpg" },
    { name: "Mediterráneo", location: "Costas del sur y penínsulas mediterráneas", description: "Los veranos son calurosos y secos; la mayor parte de la lluvia cae en otoño e invierno. La precipitación anual suele estar entre 300 y 900 mm, pero cambia mucho con la exposición y el relieve.", temperature: "Invierno: ~5–15 °C · verano: ~20–30 °C", image: "europe-venice-canal.jpg", alt: "Gran Canal y arquitectura de Venecia, Italia", credit: "Didier Descouens · Wikimedia Commons · CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:(Venice)_Hotel_Principe_-_Facade_on_Grand_Canal.jpg" },
    { name: "Polar y subpolar", location: "Extremo norte de Fennoscandia e islas árticas", description: "Los inviernos son largos y rigurosos; el verano es breve. En áreas de tundra el mes más cálido no alcanza 10 °C. La precipitación suele ser baja, aproximadamente 200–500 mm, y a menudo cae como nieve.", temperature: "Invierno: frecuentemente <−10 °C · verano: ~0–10 °C", image: "europe-polar-tundra.jpg", alt: "Tundra ártica otoñal junto al lago Lovozero, región de Múrmansk, Rusia", credit: "Artem Abdukakharov · Wikimedia Commons · CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Arctic_tundra_in_autumn_colors_near_lake_Lovozero_in_Murmansk_Oblast,_Russia.jpg" },
    { name: "De montaña", location: "Alpes, Pirineos, Cárpatos y otros macizos", description: "La temperatura desciende con la altitud y la precipitación cambia entre laderas expuestas y sotavento. En muchas vertientes montañosas se superan 1.000 mm anuales; la nieve estacional y los glaciares aparecen en las mayores alturas.", temperature: "Desciende aproximadamente 0,6 °C por cada 100 m", image: "europe-alps-arnisee.jpg", alt: "Valles y cumbres alpinas en la región de Arnisee, Suiza", credit: "Simon Koopmann · Wikimedia Commons · CC BY-SA 2.5", source: "https://commons.wikimedia.org/wiki/File:Landscape_Arnisee-region.JPG" }
  ],
  asia: [
    { name: "Polar", location: "Litoral ártico y archipiélagos del norte de Siberia", description: "El invierno es muy largo y el verano, corto; en la tundra el mes más cálido promedia menos de 10 °C. La precipitación suele ser escasa, cerca de 150–500 mm anuales, con nieve y permafrost en extensas áreas.", temperature: "Invierno: a menudo <−20 °C · verano: ~0–10 °C", image: "asia-siberian-arctic.jpg", alt: "Imagen satelital del paisaje estival de Siberia noroccidental", credit: "MODIS Land Rapid Response Team · NASA GSFC · dominio público", source: "https://commons.wikimedia.org/wiki/File:Summer_in_Northwestern_Siberia_(MODIS_2025-08-20).jpg" },
    { name: "Continental", location: "Siberia meridional, Mongolia y Asia interior", description: "La distancia al océano favorece una amplitud térmica anual muy grande, con inviernos fríos y veranos cálidos o calurosos. En gran parte del interior llueven aproximadamente 250–800 mm al año, a menudo con máximo estival.", temperature: "Invierno: ~−30–0 °C · verano: ~15–30 °C", image: "asia-gobi-mongolia.jpg", alt: "Estepa árida y relieve del desierto de Gobi en Mongolia", credit: "ノボホショコロトソ · Wikimedia Commons · CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Gobi_Desert_2023_in_%C3%96mn%C3%B6govi_Province,_Mongolia_22.jpg" },
    { name: "Desértico y árido", location: "Asia occidental, mesetas y cuencas de Asia central", description: "La lluvia es muy escasa e irregular; en los desiertos suele ser menor de 250 mm anuales y en las estepas áridas, aproximadamente 250–500 mm. Son comunes la fuerte evaporación y los contrastes térmicos diarios.", temperature: "Veranos a menudo >30 °C; noches e inviernos pueden ser fríos", image: "asia-indus-valley-leh.jpg", alt: "Valle alto y seco del Indo cerca de Leh, India", credit: "KennyOMG · Wikimedia Commons · CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Indus_Valley_near_Leh.jpg" },
    { name: "Monzónico", location: "Sur, sudeste y franjas orientales de Asia", description: "Los vientos estacionales llevan aire húmedo desde los océanos y concentran lluvias en verano. En las zonas más expuestas pueden caer 1.000–3.000 mm o más al año; las sequías y crecidas varían entre temporadas.", temperature: "Temporada cálida: ~24–32 °C, con humedad elevada", image: "asia-yangtze-river.jpg", alt: "Panorama del río Yangtsé en China", credit: "Dong Zhang · Wikimedia Commons · CC0", source: "https://commons.wikimedia.org/wiki/File:A_view_of_Yangtze_River,_China_(Unsplash).jpg" },
    { name: "Tropical", location: "Archipiélagos y tierras próximas al ecuador en el sudeste asiático", description: "Hace calor todo el año y la temperatura media mensual suele superar 18 °C. La humedad y la lluvia son altas —a menudo 1.500–2.500 mm anuales—, aunque algunas áreas tienen estaciones secas y húmedas diferenciadas.", temperature: "Media mensual generalmente >18 °C; poca amplitud anual", image: "asia-trang-an.jpg", alt: "Paisaje kárstico y tierras húmedas de Tràng An, Vietnam", credit: "NASA Earth Observatory · dominio público", source: "https://commons.wikimedia.org/wiki/File:The_Towers_of_Tr%C3%A0ng_An_(154897).jpg" },
    { name: "De montaña", location: "Himalaya, meseta del Tíbet, Pamir y cordilleras vecinas", description: "La altura reduce la temperatura; las laderas expuestas a los vientos húmedos reciben más lluvia o nieve, mientras que los interiores pueden quedar en sombra pluviométrica. En las cumbres más altas persisten glaciares y nieves.", temperature: "Desciende aproximadamente 0,6 °C por cada 100 m", image: "asia-himalaya-nepal.jpg", alt: "Glaciares y cumbres altas del Himalaya en Nepal", credit: "Vyacheslav Argenberg · Wikimedia Commons · CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Himalayas,_Nepal.jpg" }
  ]
};

const geographicRegions = [
  {
    id: "europe-north",
    continent: "Europa",
    name: "Europa septentrional",
    location: "Bordes del Atlántico norte y del mar Báltico, desde Islandia y las islas británicas hasta Fennoscandia y los países bálticos.",
    countries: "Islandia, Dinamarca, Noruega, Suecia, Finlandia, Irlanda, Reino Unido, Estonia, Letonia y Lituania.",
    mapCountries: ["Iceland", "Denmark", "Norway", "Sweden", "Finland", "Ireland", "United Kingdom", "Estonia", "Latvia", "Lithuania"],
    relief: "Escudos antiguos, montañas escandinavas, costas glaciadas y llanuras bálticas.",
    climate: "Oceánico y subártico al norte; inviernos fríos y marcada estacionalidad hacia el interior.",
    society: "Población concentrada en costas y ciudades; economías de servicios, industria, energía y actividades marítimas.",
    method: "La agrupación sigue un criterio geográfico escolar; los países bálticos se incorporan al norte para esta lectura."
  },
  {
    id: "europe-west",
    continent: "Europa",
    name: "Europa occidental",
    location: "Fachada atlántica de Europa y llanuras próximas al canal de la Mancha y al mar del Norte.",
    countries: "Francia, Bélgica, Países Bajos, Luxemburgo, Mónaco y Andorra.",
    mapCountries: ["France", "Belgium", "Netherlands", "Luxembourg", "Monaco", "Andorra"],
    relief: "Cuencas y llanuras atlánticas; los Alpes y Pirineos forman altos bordes meridionales.",
    climate: "Predominan condiciones oceánicas templadas, con contrastes por latitud, altitud y distancia al mar.",
    society: "Red urbana densa y conectada; destacan servicios, industria, comercio y agricultura intensiva.",
    method: "Agrupación didáctica no política. Los microestados pueden no distinguirse en la geometría 1:110m."
  },
  {
    id: "europe-central",
    continent: "Europa",
    name: "Europa central",
    location: "Zona de transición entre las llanuras septentrionales y los arcos alpino y carpático.",
    countries: "Alemania, Polonia, Chequia, Eslovaquia, Austria, Suiza, Liechtenstein, Hungría y Eslovenia.",
    mapCountries: ["Germany", "Poland", "Czechia", "Slovakia", "Austria", "Switzerland", "Hungary", "Slovenia"],
    relief: "Llanuras, cuencas y macizos; los Alpes y los Cárpatos estructuran los bordes meridional y oriental.",
    climate: "Transición entre influencias oceánicas al oeste y continentales al este; condiciones alpinas en altura.",
    society: "Corredor histórico de intercambios y transporte; manufactura, servicios y redes urbanas transfronterizas.",
    method: "Europa central se separa aquí como región didáctica; por eso algunos países se reclasifican respecto de ONU M49."
  },
  {
    id: "europe-south",
    continent: "Europa",
    name: "Europa meridional",
    location: "Penínsulas ibérica, itálica y balcánica, junto con islas y costas del Mediterráneo.",
    countries: "Portugal, España, Italia, Grecia, Albania, Bosnia y Herzegovina, Croacia, Montenegro, Macedonia del Norte, Serbia, Kosovo, Bulgaria, Rumania, Malta, San Marino, Andorra y Chipre.",
    mapCountries: ["Portugal", "Spain", "Italy", "Greece", "Albania", "Bosnia and Herzegovina", "Croatia", "Montenegro", "North Macedonia", "Republic of Serbia", "Kosovo", "Bulgaria", "Romania", "Cyprus"],
    relief: "Penínsulas montañosas, sierras y volcanes; costas recortadas y numerosas islas.",
    climate: "El mediterráneo es extendido en las costas; las montañas y los interiores presentan otros regímenes.",
    society: "Ciudades históricas y actuales conectadas por puertos; turismo, servicios, agricultura e industria diversa.",
    method: "Agrupación didáctica. Andorra, Malta y San Marino son demasiado pequeños para verse claramente en el mapa base."
  },
  {
    id: "europe-east",
    continent: "Europa",
    name: "Europa oriental",
    location: "Grandes llanuras al este de Europa central, en dirección a los Urales y la cuenca del mar Negro.",
    countries: "Belarús, Moldavia, Rumania, Bulgaria, Ucrania y la parte europea de Rusia.",
    mapCountries: ["Belarus", "Moldova", "Romania", "Bulgaria", "Ukraine", "Russia"],
    relief: "Amplias llanuras y cuencas fluviales; los Urales constituyen un límite convencional hacia Asia.",
    climate: "Mayor continentalidad hacia el este, con inviernos fríos y estaciones contrastadas.",
    society: "Región diversa en población y economías; agricultura, industria, energía y grandes centros urbanos.",
    method: "La frontera oriental es convencional. Rusia es transcontinental y el mapa muestra el Estado completo."
  },
  {
    id: "asia-north",
    continent: "Asia",
    name: "Asia septentrional",
    location: "Siberia y el norte de Asia, entre los montes Urales y el océano Pacífico.",
    countries: "Parte asiática de la Federación de Rusia; Rusia es un Estado transcontinental.",
    mapCountries: ["Russia"],
    relief: "Llanuras y mesetas siberianas, grandes ríos que fluyen hacia el Ártico y cordilleras orientales.",
    climate: "Predominan climas fríos y continentales; el permafrost aparece en amplias áreas del norte.",
    society: "Población muy dispersa fuera de los corredores urbanos y de transporte; recursos y distancias condicionan la actividad.",
    method: "El contorno resalta Rusia completa por ser una sola unidad cartográfica, no solo su parte asiática."
  },
  {
    id: "asia-central",
    continent: "Asia",
    name: "Asia central",
    location: "Interior entre el mar Caspio, las estepas y los sistemas montañosos del Tian Shan y el Pamir.",
    countries: "Kazajistán, Kirguistán, Tayikistán, Turkmenistán y Uzbekistán.",
    mapCountries: ["Kazakhstan", "Kyrgyzstan", "Tajikistan", "Turkmenistan", "Uzbekistan"],
    relief: "Estepas, desiertos, cuencas endorreicas y montañas altas que alimentan ríos y glaciares.",
    climate: "Continental y árido en las tierras bajas; frío de montaña en los sistemas elevados.",
    society: "Ciudades-oasis y centros modernos enlazan agricultura de regadío, energía, minería y rutas continentales.",
    method: "Subregión basada en la clasificación estadística ONU M49."
  },
  {
    id: "asia-west",
    continent: "Asia",
    name: "Asia occidental",
    location: "Entre el Mediterráneo oriental, la península arábiga, el Cáucaso y las mesetas interiores.",
    countries: "Turquía, Chipre, Georgia, Armenia, Azerbaiyán, Siria, Líbano, Israel, Palestina, Jordania, Irak, Arabia Saudita, Yemen, Omán, Emiratos Árabes Unidos, Catar, Baréin y Kuwait.",
    mapCountries: ["Turkey", "Cyprus", "Georgia", "Armenia", "Azerbaijan", "Syria", "Lebanon", "Israel", "Palestine", "Jordan", "Iraq", "Saudi Arabia", "Yemen", "Oman", "United Arab Emirates", "Qatar", "Kuwait"],
    relief: "Mesetas, montañas y desiertos; el Cáucaso se eleva entre los mares Negro y Caspio.",
    climate: "Desde mediterráneo y árido hasta condiciones de alta montaña; el agua es un recurso desigual.",
    society: "Diversidad lingüística, religiosa y urbana; energía, comercio, agricultura y servicios tienen pesos distintos.",
    method: "Agrupación escolar próxima a ONU M49; algunos países y territorios se clasifican de otra manera."
  },
  {
    id: "asia-south",
    continent: "Asia",
    name: "Asia meridional",
    location: "Subcontinente indio y valles que descienden del Himalaya hacia el Índico.",
    countries: "Afganistán, Bangladés, Bután, India, Maldivas, Nepal, Pakistán, Sri Lanka e Irán.",
    mapCountries: ["Afghanistan", "Bangladesh", "Bhutan", "India", "Nepal", "Pakistan", "Sri Lanka", "Iran"],
    relief: "Himalaya al norte, llanura indogangética, meseta del Decán y archipiélagos del Índico.",
    climate: "Monzónico y tropical en amplias zonas; árido en el noroeste y alpino en las grandes alturas.",
    society: "Una de las áreas más pobladas del mundo; agricultura, manufactura y servicios conviven con fuertes contrastes.",
    method: "Países según la subregión estadística ONU M49; las fronteras nacionales no delimitan cuencas ni áreas culturales."
  },
  {
    id: "asia-east",
    continent: "Asia",
    name: "Asia oriental",
    location: "Litorales del Pacífico noroccidental, península coreana, archipiélago japonés y Mongolia.",
    countries: "China, Mongolia, Japón, Corea del Norte, Corea del Sur y Taiwán; Hong Kong y Macao son regiones administrativas especiales de China.",
    mapCountries: ["China", "Mongolia", "Japan", "North Korea", "South Korea", "Taiwan"],
    relief: "Mesetas y cuencas interiores contrastan con cordilleras, penínsulas e islas volcánicas.",
    climate: "Desde continental y frío en el norte hasta subtropical húmedo en el este y el sur.",
    society: "Grandes áreas urbanas y economías industriales y de servicios; diversidad interna y vínculos transpacíficos.",
    method: "Agrupación ONU M49 con Taiwán mostrado según la unidad cartográfica de Natural Earth."
  },
  {
    id: "asia-southeast",
    continent: "Asia",
    name: "Sudeste asiático",
    location: "Penínsulas y archipiélagos entre los océanos Índico y Pacífico.",
    countries: "Brunéi, Camboya, Indonesia, Laos, Malasia, Myanmar, Filipinas, Singapur, Tailandia, Timor-Leste y Vietnam.",
    mapCountries: ["Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia", "Myanmar", "Philippines", "Thailand", "East Timor", "Vietnam"],
    relief: "Cordilleras tropicales, grandes deltas y miles de islas; parte de la región integra el cinturón de fuego del Pacífico.",
    climate: "Predominan climas tropicales húmedos y monzónicos, con variaciones por altitud y distancia al mar.",
    society: "Puertos y metrópolis articulan manufactura, agricultura, pesca, servicios y redes comerciales.",
    method: "Subregión ONU M49; Singapur puede no distinguirse como polígono en la cartografía 1:110m."
  }
];

const geographicHighlights = [
  { name: "Alpes", continent: "Europa", kind: "Cordillera", location: "Arco centro-sur de Europa · 46° N, 9° E", description: "Cadena montañosa joven con glaciares, valles profundos y divisorias que alimentan cuencas hacia el mar del Norte, el Mediterráneo y el mar Negro.", importance: "Afecta la circulación, el transporte y la distribución de aguas entre regiones densamente pobladas.", image: "europe-alps-arnisee.jpg", alt: "Cumbres y valles de los Alpes en la región de Arnisee, Suiza", credit: "Simon Koopmann · Wikimedia Commons · CC BY-SA 2.5", source: "https://commons.wikimedia.org/wiki/File:Landscape_Arnisee-region.JPG", region: "europe-central" },
  { name: "Montes Urales", continent: "Europa–Asia", kind: "Cordillera antigua", location: "Rusia y Kazajistán · cerca de 60° N, 60° E", description: "Cordillera de orientación norte-sur que suele utilizarse como parte del límite convencional entre Europa y Asia.", importance: "Muestra que la división continental es una convención geográfica, no una separación oceánica.", image: "europe-urals.jpg", alt: "Paisaje montañoso de los Urales circumpolares", credit: "ugraland · Wikimedia Commons · CC BY 2.0", source: "https://commons.wikimedia.org/wiki/File:Mountain_landscape_in_the_Circumpolar_Urals.jpg", region: "europe-east" },
  { name: "Pirineos", continent: "Europa", kind: "Cordillera", location: "Entre España, Francia y Andorra · 42° N, 1° E", description: "Barrera montañosa que separa la península ibérica del resto de Europa occidental.", importance: "Su relieve condiciona pasos, cuencas y contrastes climáticos locales.", image: "europe-pyrenees.jpg", alt: "Macizo pirenaico en el Parque Nacional de los Pirineos, Francia", credit: "Moahim · Wikimedia Commons · CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:2019_-_Parc_national_des_Pyrenees_-_refuge_des_Espuguettes.jpg", region: "europe-west" },
  { name: "Río Danubio", continent: "Europa", kind: "Río", location: "Europa central y sudoriental; desemboca en el mar Negro · 47° N, 20° E", description: "Gran eje fluvial que conecta cuencas, ciudades y países desde Europa central hasta el delta del mar Negro.", importance: "Es una vía de transporte y un sistema ecológico compartido por varios Estados.", image: "europe-danube-wachau.jpg", alt: "Crucero sobre el Danubio en el valle de Wachau, cerca de Dürnstein, Austria", credit: "Naturpuur · Wikimedia Commons · CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:River_cruise_ship_%22Spirit_of_the_Danube%22,_Cultural_landscape_of_Wachau_near_D%C3%BCrnstein,_Lower_Austria.jpg", region: "europe-central" },
  { name: "Río Volga", continent: "Europa", kind: "Río", location: "Rusia europea · 48° N, 44° E", description: "El río más largo de Europa recorre la Rusia europea y desemboca en el mar Caspio.", importance: "Su cuenca sostiene ciudades, navegación, agricultura y embalses.", image: "europe-volga-nizhny-novgorod.jpg", alt: "Río Volga junto al paseo ribereño de Nizhni Nóvgorod, Rusia", credit: "Алексей Трефилов · Wikimedia Commons · CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Volga_River_Embankment_in_Nizhny_Novgorod.jpg", region: "europe-east" },
  { name: "Gran Llanura Europea", continent: "Europa", kind: "Llanura", location: "Desde Europa occidental y central hacia Rusia · 53° N, 25° E", description: "Amplia región de baja altitud, interrumpida por mesetas y sistemas montañosos.", importance: "Facilitó corredores de transporte y concentra suelos agrícolas y asentamientos.", image: "europe-great-plain-mecklenburg.jpg", alt: "Campos agrícolas de Koszwały, en las tierras bajas del norte de Polonia", credit: "Andrzej Otrębski · Wikimedia Commons · CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Koszwaly_rzepak_2.jpg", region: "europe-east" },
  { name: "Himalaya", continent: "Asia", kind: "Cordillera", location: "Al norte del subcontinente indio · 28° N, 86° E", description: "Arco montañoso de gran altitud formado por la convergencia entre India y Eurasia.", importance: "Influye en el clima regional y en el origen de ríos que abastecen a poblaciones aguas abajo.", image: "asia-himalaya-nepal.jpg", alt: "Glaciares y cumbres altas del Himalaya en Nepal", credit: "Vyacheslav Argenberg · Wikimedia Commons · CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Himalayas,_Nepal.jpg", region: "asia-south" },
  { name: "Meseta del Tíbet", continent: "Asia", kind: "Meseta", location: "Suroeste de China · 33° N, 88° E", description: "Extensa región de gran altitud al norte del Himalaya, rodeada por algunas de las cordilleras más elevadas del planeta.", importance: "Su altura y extensión influyen en la circulación atmosférica y en la alimentación de grandes cuencas.", image: "asia-tibetan-plateau.jpg", alt: "Paisaje abierto de la meseta tibetana", credit: "Jan Kranendonk · Wikimedia Commons · CC BY-SA 4.0", source: "https://commons.wikimedia.org/wiki/File:Landscape_of_the_Tibetan_Plateau.jpg", region: "asia-east" },
  { name: "Desierto de Gobi", continent: "Asia", kind: "Desierto frío", location: "Mongolia y norte de China · 43° N, 104° E", description: "Región árida de Asia interior formada por estepas, mesetas y áreas desérticas.", importance: "Sus grandes amplitudes térmicas muestran la continentalidad del interior asiático.", image: "asia-gobi-mongolia.jpg", alt: "Paisaje árido del desierto de Gobi en la provincia de Ömnögovi, Mongolia", credit: "ノボホショコロトソ · Wikimedia Commons · CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Gobi_Desert_2023_in_%C3%96mn%C3%B6govi_Province,_Mongolia_22.jpg", region: "asia-east" },
  { name: "Montes Cáucaso", continent: "Europa–Asia", kind: "Sistema montañoso", location: "Entre los mares Negro y Caspio · 42° N, 44° E", description: "Conjunto de cordilleras y valles que forma parte de distintas propuestas para el límite entre Europa y Asia.", importance: "La ubicación del límite cambia según la convención adoptada.", image: "asia-caucasus-zagedan.jpg", alt: "Cresta y valle de Zagedan en el Cáucaso, Rusia", credit: "Vyacheslav Argenberg · Wikimedia Commons · CC BY 4.0", source: "https://commons.wikimedia.org/wiki/File:Zagedan_Ridge,_Zagedan_Valley,_Caucasus_Mountains,_Karachay-Cherkessia.jpg", region: "asia-west" },
  { name: "Río Yangtsé", continent: "Asia", kind: "Río", location: "China central y oriental · 30° N, 110° E", description: "El río más largo de Asia atraviesa grandes cuencas y desemboca en el mar de China Oriental.", importance: "Su cuenca concentra ciudades, agricultura, transporte y ecosistemas de gran escala.", image: "asia-yangtze-river.jpg", alt: "Panorama del río Yangtsé en China", credit: "Dong Zhang · Wikimedia Commons · CC0", source: "https://commons.wikimedia.org/wiki/File:A_view_of_Yangtze_River,_China_(Unsplash).jpg", region: "asia-east" },
  { name: "Río Indo", continent: "Asia", kind: "Río", location: "Desde la meseta tibetana hasta el mar Arábigo · 27° N, 68° E", description: "Sistema fluvial que nace en Asia interior y recorre el norte del subcontinente antes de formar un delta.", importance: "Sus aguas son esenciales para el riego y la vida en una región con disponibilidad hídrica desigual.", image: "asia-indus-valley-leh.jpg", alt: "Valle alto del Indo cerca de Leh, India", credit: "KennyOMG · Wikimedia Commons · CC BY-SA 3.0", source: "https://commons.wikimedia.org/wiki/File:Indus_Valley_near_Leh.jpg", region: "asia-south" }
];

function setupTopicExplorers() {
  document.querySelectorAll("[data-topic-explorer]").forEach((explorer) => {
    const continent = explorer.dataset.topicExplorer;
    const topics = continentTopics[continent];
    const tabs = Array.from(explorer.querySelectorAll("[data-topic]"));
    const panel = explorer.querySelector('[role="tabpanel"]');
    const kicker = panel?.querySelector(".topic-kicker");
    const title = panel?.querySelector("h3");
    const text = panel?.querySelector("p:not(.topic-kicker)");
    const list = panel?.querySelector("ul");
    if (!topics || !panel || !kicker || !title || !text || !list) return;

    panel.id = `${continent}-topic-panel`;
    tabs.forEach((tab) => {
      tab.id = `${continent}-${tab.dataset.topic}-tab`;
      tab.setAttribute("aria-controls", panel.id);
    });
    const activate = (tab) => {
      const topic = topics[tab.dataset.topic];
      if (!topic) return;
      tabs.forEach((item) => {
        const selected = item === tab;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      panel.setAttribute("aria-labelledby", `${continent}-${tab.dataset.topic}-tab`);
      kicker.textContent = topic.kicker;
      title.textContent = topic.title;
      text.textContent = topic.text;
      list.replaceChildren(...topic.points.map((point) => {
        const item = document.createElement("li");
        item.textContent = point;
        return item;
      }));
      panel.dataset.topic = tab.dataset.topic;
      window.dispatchEvent(new CustomEvent("atlas:theme", { detail: { continent, topic: tab.dataset.topic } }));
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
        nextTab.focus();
        activate(nextTab);
      });
    });
    activate(tabs.find((tab) => tab.getAttribute("aria-selected") === "true") || tabs[0]);
  });
}

function setupPhotoCarousels() {
  document.querySelectorAll("[data-photo-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-gallery-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const count = carousel.querySelector("[data-carousel-count]");
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    if (!slides.length || slides.length !== dots.length || !previous || !next) return;
    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

    const show = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("role", "tabpanel");
        slide.tabIndex = active ? 0 : -1;
        slide.setAttribute("aria-hidden", String(!active));
        slide.id = `${carousel.dataset.photoCarousel}-gallery-slide-${slideIndex + 1}`;
      });
      dots.forEach((dot, dotIndex) => {
        dot.setAttribute("aria-selected", String(dotIndex === activeIndex));
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-controls", slides[dotIndex].id);
        dot.tabIndex = dotIndex === activeIndex ? 0 : -1;
      });
      slides[activeIndex].setAttribute("aria-labelledby", `${carousel.dataset.photoCarousel}-gallery-tab-${activeIndex + 1}`);
      dots.forEach((dot, dotIndex) => {
        dot.id = `${carousel.dataset.photoCarousel}-gallery-tab-${dotIndex + 1}`;
      });
      if (count) count.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    };

    previous.addEventListener("click", () => show(activeIndex - 1));
    next.addEventListener("click", () => show(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => show(index)));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") show(activeIndex - 1);
      if (event.key === "ArrowRight") show(activeIndex + 1);
    });
    show(activeIndex);
  });
}

function setupPhotoLightbox() {
  const dialog = document.querySelector("#photo-lightbox");
  const image = document.querySelector("#lightbox-image");
  const title = document.querySelector("#lightbox-title");
  const location = document.querySelector("#lightbox-location");
  const description = document.querySelector("#lightbox-description");
  const credit = document.querySelector("#lightbox-credit");
  const closeButton = dialog?.querySelector(".lightbox-close");
  if (!dialog || !image || !title || !location || !description || !credit || !closeButton) return;

  document.addEventListener("click", (event) => {
    const button = event.target instanceof Element ? event.target.closest("[data-lightbox-open]") : null;
    if (!button) return;
    const slide = button.closest("[data-gallery-slide]");
    const card = button.closest(".landform-card, .climate-zone-card");
    const sourceImage = (slide || card)?.querySelector("img");
    if (!sourceImage) return;

    image.src = sourceImage.currentSrc || sourceImage.src;
    image.alt = sourceImage.alt;
    if (slide) {
      const copy = slide.querySelector(".gallery-copy");
      if (!copy) return;
      title.textContent = copy.querySelector("h4")?.textContent || "";
      location.textContent = copy.querySelector("span")?.textContent || "";
      const summary = copy.querySelector("p:not(.gallery-fact)")?.textContent || "";
      const fact = copy.querySelector(".gallery-fact")?.textContent || "";
      description.textContent = [summary, fact].filter(Boolean).join(" ");
      credit.textContent = slide.querySelector("figcaption")?.textContent.trim() || "";
    } else if (card) {
      title.textContent = card.querySelector("h4")?.textContent || "";
      location.textContent = card.querySelector(".landform-location, .climate-location")?.textContent || "";
      description.textContent = Array.from(card.querySelectorAll(".landform-card > p:not(.landform-kicker, .landform-location), .climate-zone-card > p"))
        .map((paragraph) => paragraph.textContent.trim())
        .filter(Boolean)
        .join(" ");
      credit.textContent = card.querySelector("figcaption")?.textContent.trim() || "";
    }
    if (!dialog.open) dialog.showModal();
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

const MAP_SVG_NS = "http://www.w3.org/2000/svg";
const MAP_EXTENT = { west: -25, east: 180, south: -12, north: 82 };

function projectMapCoordinate(longitude, latitude) {
  return {
    x: ((longitude - MAP_EXTENT.west) / (MAP_EXTENT.east - MAP_EXTENT.west)) * 1000,
    y: ((MAP_EXTENT.north - latitude) / (MAP_EXTENT.north - MAP_EXTENT.south)) * 500
  };
}

function mapPathForCoordinates(coordinates, closePath) {
  let previousLongitude = null;
  const path = coordinates.map((coordinate, index) => {
    let longitude = coordinate[0];
    if (previousLongitude !== null && Math.abs(longitude - previousLongitude) > 180) {
      longitude += longitude < previousLongitude ? 360 : -360;
    }
    previousLongitude = longitude;
    const point = projectMapCoordinate(longitude, coordinate[1]);
    return `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`;
  }).join(" ");
  return closePath ? `${path} Z` : path;
}

function mapPathForGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => mapPathForCoordinates(ring, true)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flatMap((polygon) => polygon.map((ring) => mapPathForCoordinates(ring, true))).join(" ");
  }
  if (geometry.type === "LineString") {
    return mapPathForCoordinates(geometry.coordinates, false);
  }
  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.map((line) => mapPathForCoordinates(line, false)).join(" ");
  }
  return "";
}

function collectMapCoordinates(coordinates, result = []) {
  if (!Array.isArray(coordinates)) return result;
  if (typeof coordinates[0] === "number") {
    result.push(coordinates);
    return result;
  }
  coordinates.forEach((coordinate) => collectMapCoordinates(coordinate, result));
  return result;
}

function setupClimateCards() {
  Object.entries(climateZones).forEach(([continent, zones]) => {
    const container = document.querySelector(`#${continent}-climate-grid`);
    if (!container) return;
    zones.forEach((zone) => {
      const card = document.createElement("article");
      card.className = "climate-zone-card";
      const figure = document.createElement("figure");
      figure.className = "climate-zone-photo";
      const image = document.createElement("img");
      image.src = `./assets/photos/${zone.image}`;
      image.alt = zone.alt;
      image.loading = "lazy";
      const zoom = document.createElement("button");
      zoom.type = "button";
      zoom.className = "photo-zoom";
      zoom.dataset.lightboxOpen = "";
      zoom.setAttribute("aria-label", `Ampliar foto: ${zone.name} · ${zone.location}`);
      zoom.textContent = "⤢";
      const caption = document.createElement("figcaption");
      const source = document.createElement("a");
      source.href = zone.source;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.textContent = zone.credit;
      caption.append(source);
      figure.append(image, zoom, caption);

      const kicker = document.createElement("span");
      kicker.className = "climate-zone-kicker";
      kicker.textContent = `${continent === "europa" ? "EUROPA" : "ASIA"} · TIPO CLIMÁTICO`;
      const title = document.createElement("h4");
      title.textContent = zone.name;
      const location = document.createElement("p");
      location.className = "climate-location";
      location.textContent = zone.location;
      const description = document.createElement("p");
      description.textContent = zone.description;
      const temperature = document.createElement("p");
      temperature.className = "climate-temperature";
      const temperatureLabel = document.createElement("strong");
      temperatureLabel.textContent = "Temperatura orientativa";
      temperature.append(temperatureLabel, document.createTextNode(zone.temperature));
      card.append(figure, kicker, title, location, description, temperature);
      container.append(card);
    });
  });
}

function setupClimateMapOverlays() {
  const overlays = Array.from(document.querySelectorAll("[data-climate-overlay]"));
  if (!overlays.length) return;
  const bounds = {
    europe: { west: -25, east: 45, south: 34, north: 72 },
    asia: { west: 25, east: 180, south: -10, north: 82 }
  };
  window.addEventListener("atlas:geography-loaded", (event) => {
    overlays.forEach((overlay) => {
      const area = bounds[overlay.dataset.climateOverlay];
      if (!area) return;
      const topLeft = projectMapCoordinate(area.west, area.north);
      const bottomRight = projectMapCoordinate(area.east, area.south);
      overlay.setAttribute("viewBox", `${topLeft.x} ${topLeft.y} ${bottomRight.x - topLeft.x} ${bottomRight.y - topLeft.y}`);
      const outlines = event.detail.features.map((feature) => {
        const path = document.createElementNS(MAP_SVG_NS, "path");
        path.setAttribute("d", mapPathForGeometry(feature.geometry));
        path.setAttribute("class", "climate-country-outline");
        return path;
      });
      overlay.replaceChildren(...outlines);
    });
  });
}

const conflictMapData = {
  europe: {
    bounds: { west: -15, east: 45, south: 30, north: 72 },
    markers: [
      { id: "ukraine", code: "UKR", label: "Ucrania", longitude: 31, latitude: 49, type: "war" },
      { id: "security", code: "ESTE", label: "Flanco oriental europeo", longitude: 27, latitude: 56, type: "tension" },
      { id: "kosovo", code: "KOS", label: "Kosovo y Serbia", longitude: 20.8, latitude: 42.6, type: "dispute" },
      { id: "cyprus", code: "CYP", label: "Chipre", longitude: 33, latitude: 35, type: "dispute" }
    ]
  },
  asia: {
    bounds: { west: 25, east: 155, south: -5, north: 82 },
    markers: [
      { id: "palestine", code: "GAZA", label: "Israel y Palestina", longitude: 34.4, latitude: 31.4, type: "war" },
      { id: "golan", code: "GOLÁN", label: "Altos del Golán", longitude: 35.8, latitude: 33, type: "dispute" },
      { id: "tibet", code: "TÍBET", label: "Tíbet", longitude: 89, latitude: 31, type: "politics" },
      { id: "taiwan", code: "TAIWÁN", label: "Estrecho de Taiwán", longitude: 121, latitude: 24, type: "tension" },
      { id: "south-china-sea", code: "MAR", label: "Mar de China Meridional", longitude: 113, latitude: 12, type: "dispute" }
    ]
  }
};

function setupConflictMaps() {
  const maps = Array.from(document.querySelectorAll("[data-conflict-map]"));
  if (!maps.length) return;
  window.addEventListener("atlas:geography-loaded", (event) => {
    maps.forEach((map) => {
      const area = conflictMapData[map.dataset.conflictMap];
      if (!area) return;
      const topLeft = projectMapCoordinate(area.bounds.west, area.bounds.north);
      const bottomRight = projectMapCoordinate(area.bounds.east, area.bounds.south);
      map.setAttribute("viewBox", `${topLeft.x} ${topLeft.y} ${bottomRight.x - topLeft.x} ${bottomRight.y - topLeft.y}`);
      const countries = event.detail.features.map((feature) => {
        const path = document.createElementNS(MAP_SVG_NS, "path");
        path.setAttribute("d", mapPathForGeometry(feature.geometry));
        path.setAttribute("class", "conflict-map-country");
        const title = document.createElementNS(MAP_SVG_NS, "title");
        title.textContent = feature.properties.NAME_ES || feature.properties.ADMIN;
        path.append(title);
        return path;
      });
      const markers = area.markers.map((marker) => {
        const point = projectMapCoordinate(marker.longitude, marker.latitude);
        const group = document.createElementNS(MAP_SVG_NS, "g");
        group.setAttribute("class", `conflict-map-marker is-${marker.type}`);
        group.setAttribute("role", "button");
        group.setAttribute("tabindex", "0");
        group.setAttribute("aria-label", `Ubicación aproximada: ${marker.label}`);
        const hitArea = document.createElementNS(MAP_SVG_NS, "circle");
        hitArea.setAttribute("class", "marker-hit-area");
        hitArea.setAttribute("cx", String(point.x));
        hitArea.setAttribute("cy", String(point.y));
        hitArea.setAttribute("r", "12");
        const circle = document.createElementNS(MAP_SVG_NS, "circle");
        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute("r", "5");
        const text = document.createElementNS(MAP_SVG_NS, "text");
        text.setAttribute("x", String(point.x));
        text.setAttribute("y", String(point.y - 9));
        text.textContent = marker.code;
        group.append(hitArea, circle, text);
        const focusCard = () => {
          const card = document.querySelector(`[data-conflict="${marker.id}"]`);
          if (!card) return;
          card.tabIndex = -1;
          card.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
          card.focus({ preventScroll: true });
        };
        group.addEventListener("click", focusCard);
        group.addEventListener("keydown", (keyboardEvent) => {
          if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") return;
          keyboardEvent.preventDefault();
          focusCard();
        });
        return group;
      });
      map.replaceChildren(...countries, ...markers);
    });
  });
}

let focusRegionOnMap = () => {};

function setupRegionExplorer() {
  const buttons = Array.from(document.querySelectorAll("[data-region-select]"));
  const regionName = document.querySelector("#region-name");
  const regionKicker = document.querySelector("#region-kicker");
  const regionLocation = document.querySelector("#region-location");
  const regionCountries = document.querySelector("#region-countries");
  const regionRelief = document.querySelector("#region-relief");
  const regionClimate = document.querySelector("#region-climate");
  const regionSociety = document.querySelector("#region-society");
  const regionMethod = document.querySelector("#region-method");
  const preview = document.querySelector("#region-map-preview");
  const previewTitle = document.querySelector("#region-map-title");
  const previewDescription = document.querySelector("#region-map-description");
  const previewCaption = document.querySelector("#region-map-caption");
  const mapAction = document.querySelector("#region-map-action");
  if (!buttons.length || !regionName || !preview || !mapAction) return;

  let selectedRegion = geographicRegions.find((region) => region.id === "europe-central");
  let mapFeatures = [];

  const renderPreview = (region) => {
    const matches = mapFeatures.filter((feature) => region.mapCountries.includes(feature.properties.ADMIN));
    const coordinates = matches.flatMap((feature) => collectMapCoordinates(feature.geometry.coordinates));
    if (coordinates.length) {
      const points = coordinates.map((coordinate) => projectMapCoordinate(coordinate[0], coordinate[1]));
      const bounds = points.reduce((result, point) => ({
        minX: Math.min(result.minX, point.x),
        maxX: Math.max(result.maxX, point.x),
        minY: Math.min(result.minY, point.y),
        maxY: Math.max(result.maxY, point.y)
      }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
      const { minX, maxX, minY, maxY } = bounds;
      const paddingX = Math.max((maxX - minX) * 0.18, 12);
      const paddingY = Math.max((maxY - minY) * 0.18, 12);
      preview.setAttribute("viewBox", `${minX - paddingX} ${minY - paddingY} ${Math.max(maxX - minX + paddingX * 2, 24)} ${Math.max(maxY - minY + paddingY * 2, 24)}`);
    } else {
      preview.setAttribute("viewBox", "0 0 1000 500");
    }

    const paths = mapFeatures.map((feature) => {
      const path = document.createElementNS(MAP_SVG_NS, "path");
      const active = region.mapCountries.includes(feature.properties.ADMIN);
      path.setAttribute("d", mapPathForGeometry(feature.geometry));
      path.setAttribute("class", active ? "region-map-land is-highlighted" : "region-map-land");
      path.setAttribute("fill", active ? "#c9a477" : "#24434d");
      path.setAttribute("stroke", active ? "#f1dfbd" : "#77918d");
      path.setAttribute("stroke-width", active ? "1.1" : "0.55");
      if (active) {
        const title = document.createElementNS(MAP_SVG_NS, "title");
        title.textContent = feature.properties.NAME_ES || feature.properties.ADMIN;
        path.append(title);
      }
      return path;
    });
    preview.replaceChildren(...[previewTitle, previewDescription, ...paths].filter(Boolean));
    previewTitle.textContent = `Mapa de ${region.name}`;
    previewDescription.textContent = `${region.name} destacada sobre las regiones vecinas.`;
    if (previewCaption) previewCaption.textContent = region.name;
  };

  const selectRegion = (region) => {
    if (!region) return;
    selectedRegion = region;
    buttons.forEach((button) => {
      const active = button.dataset.regionSelect === region.id;
      button.setAttribute("aria-pressed", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    if (regionKicker) regionKicker.textContent = `${region.continent.toUpperCase()} · ÁREA GEOGRÁFICA`;
    regionName.textContent = region.name;
    if (regionLocation) regionLocation.textContent = region.location;
    if (regionCountries) regionCountries.textContent = region.countries;
    if (regionRelief) regionRelief.textContent = region.relief;
    if (regionClimate) regionClimate.textContent = region.climate;
    if (regionSociety) regionSociety.textContent = region.society;
    if (regionMethod) regionMethod.textContent = region.method;
    renderPreview(region);
    window.dispatchEvent(new CustomEvent("atlas:region-select", { detail: region }));
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      selectRegion(geographicRegions.find((region) => region.id === button.dataset.regionSelect));
    });
    button.addEventListener("keydown", (event) => {
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
          : event.key === "Home" ? -Infinity
            : event.key === "End" ? Infinity
              : 0;
      if (!direction) return;
      event.preventDefault();
      const group = Array.from(button.closest(".region-button-group").querySelectorAll("[data-region-select]"));
      const currentIndex = group.indexOf(button);
      const nextIndex = direction === -Infinity ? 0
        : direction === Infinity ? group.length - 1
          : (currentIndex + direction + group.length) % group.length;
      const nextButton = group[nextIndex];
      nextButton.focus();
      selectRegion(geographicRegions.find((region) => region.id === nextButton.dataset.regionSelect));
    });
    button.tabIndex = button.dataset.regionSelect === selectedRegion?.id ? 0 : -1;
  });

  focusRegionOnMap = (regionId) => {
    const region = geographicRegions.find((item) => item.id === regionId);
    if (!region) return;
    selectRegion(region);
    document.querySelector("#map-explorer")?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center"
    });
  };
  mapAction.addEventListener("click", () => focusRegionOnMap(selectedRegion?.id));

  window.addEventListener("atlas:geography-loaded", (event) => {
    mapFeatures = event.detail.features;
    renderPreview(selectedRegion);
  });
  selectRegion(selectedRegion);
}

function setupGeographicHighlights() {
  const container = document.querySelector("#landform-grid");
  if (!container) return;

  geographicHighlights.forEach((feature) => {
    const card = document.createElement("article");
    card.className = "landform-card";
    const photo = document.createElement("figure");
    photo.className = "landform-photo";
    const image = document.createElement("img");
    image.src = `./assets/photos/${feature.image}`;
    image.alt = feature.alt;
    image.loading = "lazy";
    const zoom = document.createElement("button");
    zoom.type = "button";
    zoom.className = "photo-zoom";
    zoom.dataset.lightboxOpen = "";
    zoom.setAttribute("aria-label", `Ampliar foto: ${feature.name}`);
    zoom.textContent = "⤢";
    const caption = document.createElement("figcaption");
    const source = document.createElement("a");
    source.href = feature.source;
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    source.textContent = feature.credit;
    caption.append(source);
    photo.append(image, zoom, caption);

    const kicker = document.createElement("p");
    kicker.className = "landform-kicker";
    kicker.textContent = `${feature.continent} · ${feature.kind}`;
    const title = document.createElement("h4");
    title.textContent = feature.name;
    const location = document.createElement("p");
    location.className = "landform-location";
    location.textContent = feature.location;
    const description = document.createElement("p");
    description.textContent = feature.description;
    const importance = document.createElement("p");
    importance.className = "landform-importance";
    importance.textContent = feature.importance;
    const action = document.createElement("button");
    action.type = "button";
    action.className = "text-link landform-map-action";
    action.textContent = "Ubicar en mapa ↗";
    action.setAttribute("aria-label", `Ubicar ${feature.name} en el mapa regional`);
    action.addEventListener("click", () => focusRegionOnMap(feature.region));
    card.append(photo, kicker, title, location, description, importance, action);
    container.append(card);
  });
}

function setupEurasiaMap() {
  const map = document.querySelector("#eurasia-map");
  const status = document.querySelector("#map-status");
  const mapTitle = map?.querySelector("#map-title");
  const mapDescription = map?.querySelector("#map-description");
  const buttons = Array.from(document.querySelectorAll("[data-map-layer]"));
  const mapLabel = document.querySelector("#map-layer-label");
  const mapLegend = document.querySelector("#map-legend");
  const mapSourceNote = document.querySelector("#map-source-note");
  const selectionName = document.querySelector("#map-selection-name");
  const selectionRegion = document.querySelector("#map-selection-region");
  if (!map || !status || !buttons.length) return;

  const regionColors = {
    "Central Asia": "#c5a77e",
    "Eastern Asia": "#a7bd9e",
    "Southern Asia": "#d2ac79",
    "South-Eastern Asia": "#88aaa1",
    "Western Asia": "#bb916f",
    "Eastern Europe": "#9eb8ca",
    "Northern Europe": "#a8bdad",
    "Southern Europe": "#d3b88a",
    "Western Europe": "#b7a9c5"
  };
  const politicalColors = ["#839e97", "#a9b69b", "#c5a77e", "#829fae", "#b28c78", "#9fabc2"];
  const layerLabels = {
    physical: "Mapa físico · Natural Earth 1:110m",
    political: "Mapa político · fronteras generalizadas",
    relief: "Relieve · tintes hipsométricos 10m",
    hydrography: "Hidrografía · ríos principales de Eurasia",
    regions: "Regiones estadísticas · clasificación ONU M49"
  };
  const sourceNotes = {
    physical: "Natural Earth 1:110m · mapa base físico. Equirectangular; escala variable por latitud.",
    political: "Natural Earth 1:110m · fronteras generalizadas. Los microestados pueden no verse a esta escala.",
    relief: "Natural Earth 10m · tintes hipsométricos y sombreado recortados a Eurasia. Rangos orientativos; la tonalidad también refleja el ambiente. Proyección equirectangular; no medir distancias.",
    hydrography: "Natural Earth 1:110m · ríos principales generalizados; no incluye toda la red hidrográfica.",
    regions: "ONU M49 como referencia estadística · colores por subregión. Las fronteras no expresan soberanía."
  };
  const legendItems = {
    physical: [["land", "Tierras"], ["boundary", "Límites generalizados"]],
    political: [["political", "Países y áreas"], ["boundary", "Límites generalizados"]],
    relief: [["elevation-water", "Agua"], ["elevation-low", "≈0–200 m"], ["elevation-low-mid", "≈200–1.000 m"], ["elevation-mid", "≈1.000–3.000 m"], ["elevation-high", ">3.000 m"], ["boundary", "Límites generalizados"]],
    hydrography: [["river", "Ríos principales"], ["boundary", "Límites generalizados"]],
    regions: [["regions", "Subregiones estadísticas"], ["boundary", "Límites generalizados"]]
  };
  let features = [];
  let riverFeatures = [];
  let activeLayer = "physical";
  let selectedFeature = null;
  let highlightedRegion = null;

  const updateLegend = () => {
    if (!mapLegend) return;
    const items = (legendItems[activeLayer] || []).flatMap(([kind, label]) => {
      const swatch = document.createElement("span");
      swatch.className = `legend-swatch ${kind}`;
      const text = document.createElement("span");
      text.textContent = label;
      return [swatch, text];
    });
    mapLegend.replaceChildren(...items);
  };

  const stableIndex = (value, length) => {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) | 0;
    return Math.abs(hash) % length;
  };

  const drawMap = () => {
    map.replaceChildren(...[mapTitle, mapDescription].filter(Boolean));
    map.dataset.layer = activeLayer;
    if (activeLayer === "physical" || activeLayer === "relief" || activeLayer === "hydrography") {
      const image = document.createElementNS(MAP_SVG_NS, "image");
      const degreesPerPixel = 1000 / (MAP_EXTENT.east - MAP_EXTENT.west);
      const latitudeScale = 500 / (MAP_EXTENT.north - MAP_EXTENT.south);
      const isRelief = activeLayer === "relief";
      image.setAttribute("href", isRelief ? "./assets/maps/eurasia-hypsometric.png" : "./assets/textures/earth.jpg");
      image.setAttribute("x", isRelief ? "0" : String((-180 - MAP_EXTENT.west) * degreesPerPixel));
      image.setAttribute("y", isRelief ? "0" : String((MAP_EXTENT.north - 90) * latitudeScale));
      image.setAttribute("width", isRelief ? "1000" : String(360 * degreesPerPixel));
      image.setAttribute("height", isRelief ? "500" : String(180 * latitudeScale));
      image.setAttribute("preserveAspectRatio", "none");
      image.setAttribute("opacity", isRelief ? "1" : activeLayer === "hydrography" ? "0.35" : "0.78");
      map.append(image);
    }

    const countryLayer = document.createElementNS(MAP_SVG_NS, "g");
    countryLayer.setAttribute("class", "map-country-layer");
    features.forEach((feature) => {
      const properties = feature.properties;
      const path = document.createElementNS(MAP_SVG_NS, "path");
      const name = properties.NAME_ES || properties.ADMIN || properties.NAME;
      path.setAttribute("d", mapPathForGeometry(feature.geometry));
      path.setAttribute("class", "map-country");
      path.setAttribute("data-country", name);
      path.setAttribute("data-subregion", properties.SUBREGION || "");
      path.setAttribute("role", "button");
      path.setAttribute("tabindex", "0");
      const isSelected = feature === selectedFeature;
      path.classList.toggle("is-selected", isSelected);
      path.setAttribute("aria-pressed", String(isSelected));
      path.classList.toggle("is-region-highlight", Boolean(
        activeLayer === "regions" && highlightedRegion?.mapCountries.includes(properties.ADMIN)
      ));
      path.setAttribute("aria-label", `${name}, ${properties.SUBREGION || properties.CONTINENT}`);
      path.setAttribute("fill-rule", "evenodd");
      if (activeLayer === "political") {
        path.setAttribute("fill", politicalColors[stableIndex(properties.ADMIN || name, politicalColors.length)]);
      } else if (activeLayer === "regions") {
        const isRegionHighlight = highlightedRegion?.mapCountries.includes(properties.ADMIN);
        path.setAttribute("fill", isRegionHighlight ? "#c9a477" : regionColors[properties.SUBREGION] || "#718c91");
        path.setAttribute("fill-opacity", highlightedRegion ? isRegionHighlight ? "0.82" : "0.12" : "0.72");
      } else if (activeLayer === "relief") {
        path.setAttribute("fill", "#e7f0e2");
        path.setAttribute("fill-opacity", "0.06");
        path.setAttribute("stroke", "#d5e5e3");
      } else if (activeLayer === "hydrography") {
        path.setAttribute("fill", "#21414a");
        path.setAttribute("fill-opacity", "0.28");
        path.setAttribute("stroke", "#8ba49b");
      } else {
        path.setAttribute("fill", "#a7b49b");
        path.setAttribute("fill-opacity", "0.14");
      }
      path.setAttribute("stroke-width", activeLayer === "political" ? "0.8" : "1");
      const title = document.createElementNS(MAP_SVG_NS, "title");
      title.textContent = `${name} · ${properties.SUBREGION || properties.CONTINENT}`;
      path.append(title);
      const selectCountry = () => {
        const previousSelection = map.querySelector(".is-selected");
        previousSelection?.classList.remove("is-selected");
        previousSelection?.setAttribute("aria-pressed", "false");
        selectedFeature = feature;
        path.classList.add("is-selected");
        path.setAttribute("aria-pressed", "true");
        selectionName.textContent = name;
        selectionRegion.textContent = `${properties.SUBREGION || properties.CONTINENT} · Natural Earth 1:110m`;
      };
      path.addEventListener("click", selectCountry);
      path.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCountry();
        }
      });
      countryLayer.append(path);
    });
    map.append(countryLayer);

    if (activeLayer === "hydrography") {
      const riverLayer = document.createElementNS(MAP_SVG_NS, "g");
      riverLayer.setAttribute("class", "map-river-layer");
      riverFeatures.forEach((feature) => {
        const river = document.createElementNS(MAP_SVG_NS, "path");
        const name = feature.properties.name_es || feature.properties.name_en || feature.properties.name || "Río sin nombre";
        river.setAttribute("d", mapPathForGeometry(feature.geometry));
        river.setAttribute("class", "map-river");
        river.setAttribute("tabindex", "0");
        river.setAttribute("role", "button");
        river.setAttribute("aria-label", `${name}, río principal`);
        const title = document.createElementNS(MAP_SVG_NS, "title");
        title.textContent = `${name} · Natural Earth 1:110m`;
        river.append(title);
        const selectRiver = () => {
          selectionName.textContent = name;
          selectionRegion.textContent = "Río principal · trazado generalizado; Natural Earth 1:110m";
        };
        river.addEventListener("click", selectRiver);
        river.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            selectRiver();
          }
        });
        riverLayer.append(river);
      });
      map.append(riverLayer);
    }

    if (mapLabel) mapLabel.textContent = layerLabels[activeLayer];
    if (mapTitle) mapTitle.textContent = layerLabels[activeLayer];
    if (mapDescription) mapDescription.textContent = sourceNotes[activeLayer];
    if (mapSourceNote) mapSourceNote.textContent = sourceNotes[activeLayer];
    updateLegend();
    status.textContent = highlightedRegion && activeLayer === "regions"
      ? `${highlightedRegion.name} resaltada · ${features.length} unidades cartográficas de Europa y Asia.`
      : activeLayer === "hydrography" && !riverFeatures.length
        ? "Cargando trazados fluviales locales…"
        : `${features.length} unidades cartográficas de Europa y Asia; seleccioná un contorno para consultar su región.`;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeLayer = button.dataset.mapLayer;
      buttons.forEach((item) => {
        const selected = item === button;
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });
      drawMap();
    });
    button.addEventListener("keydown", (event) => {
      const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
          : 0;
      if (!direction) return;
      event.preventDefault();
      const next = buttons[(buttons.indexOf(button) + direction + buttons.length) % buttons.length];
      next.focus();
      next.click();
    });
    button.tabIndex = button.getAttribute("aria-selected") === "true" ? 0 : -1;
  });

  window.addEventListener("atlas:region-select", (event) => {
    highlightedRegion = event.detail;
    activeLayer = "regions";
    selectedFeature = null;
    buttons.forEach((button) => {
      const selected = button.dataset.mapLayer === activeLayer;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    selectionName.textContent = highlightedRegion.name;
    selectionRegion.textContent = highlightedRegion.location;
    drawMap();
  });

  fetch("./assets/data/ne_110m_admin_0_countries.geojson")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      features = data.features.filter((feature) => ["Europe", "Asia"].includes(feature.properties.CONTINENT));
      if (!features.length) throw new Error("El archivo cartográfico no contiene países de Europa y Asia.");
      drawMap();
      window.dispatchEvent(new CustomEvent("atlas:geography-loaded", { detail: { features } }));
    })
    .catch((error) => {
      console.error("No se pudieron cargar los datos cartográficos locales:", error);
      status.textContent = "No se pudo cargar el mapa. Abrí el proyecto mediante Live Server y verificá assets/data.";
    });

  fetch("./assets/data/ne_110m_rivers_lake_centerlines.geojson")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const eurasianRiverNames = new Set(["Brahmaputra", "Mekong", "Ob", "Danube", "Lena", "Yangtze"]);
      const uniqueRivers = new Map();
      data.features.forEach((feature) => {
        const [west, south, east, north] = feature.bbox || [];
        const name = feature.properties.name_en || feature.properties.name;
        const isEurasianRiver = west >= MAP_EXTENT.west && east <= MAP_EXTENT.east
          && north >= MAP_EXTENT.south && south <= MAP_EXTENT.north
          && eurasianRiverNames.has(name);
        if (!name || !isEurasianRiver
          || (feature.geometry?.type !== "LineString" && feature.geometry?.type !== "MultiLineString")) return;
        const existing = uniqueRivers.get(name);
        const coordinateCount = collectMapCoordinates(feature.geometry.coordinates).length;
        const existingCoordinateCount = existing
          ? collectMapCoordinates(existing.geometry.coordinates).length
          : 0;
        if (coordinateCount > existingCoordinateCount) uniqueRivers.set(name, feature);
      });
      riverFeatures = Array.from(uniqueRivers.values());
      if (!riverFeatures.length) throw new Error("El archivo de hidrografía no contiene cursos fluviales.");
      if (activeLayer === "hydrography") drawMap();
    })
    .catch((error) => {
      console.error("No se pudo cargar la hidrografía local:", error);
      if (activeLayer === "hydrography") {
        status.textContent = "No se pudo cargar la hidrografía. Verificá assets/data/ne_110m_rivers_lake_centerlines.geojson.";
      }
    });
}

function sizeComparisonBars() {
  document.querySelectorAll("[data-compare-values]").forEach((row) => {
    const values = row.dataset.compareValues.split(",").map(Number);
    const maximum = Math.max(...values);
    row.querySelectorAll("[data-compare-bar]").forEach((bar) => {
      const index = Number(bar.dataset.compareBar);
      bar.style.width = `${Math.max(3, (values[index] / maximum) * 100)}%`;
    });
  });
}

setupTopicExplorers();
setupPhotoCarousels();
setupClimateCards();
setupPhotoLightbox();
setupRegionExplorer();
setupGeographicHighlights();
setupClimateMapOverlays();
setupConflictMaps();
setupEurasiaMap();
sizeComparisonBars();

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray(".continent-heading, .atlas-heading, .compare-heading").forEach((element) => {
    gsap.fromTo(element, { y: 28, opacity: 0 }, {
      y: 0,
      opacity: 1,
      duration: 0.85,
      ease: "power2.out",
      scrollTrigger: { trigger: element, start: "top 88%", once: true }
    });
  });
}
