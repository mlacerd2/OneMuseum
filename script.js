/* 
  Tell us about your project below!👇

  I wanted to do something related to art. Creating one space where all museums 
  could be accessed seemed like a pretty cool thing to do. So the idea here is
  to offer a museum experience to the end user that simplifies virtual museums.
  Instead of visiting each museum's website to see their works, you can just
  connect to one museum's website and see every museum's body of hosted works.

  To this end, I've chosen to connect to two APIs:
  1. The Art Institute of Chicago (https://api.artic.edu/docs/)
  2. The Metropolitan Museum of Art (https://metmuseum.github.io/)

  My project mimics the user experience in a museum website as closely as possible.
  First, the user types in the name of an artist they'd like to see art of. I did
  consider trying to make it so you could search by the name of a work in addition
  to searching by artist, but there were some technical issues that arose so I decided
  to keep it simple for this first run. Therefore, the input field will only accept
  artist names.

  We then take that input and use each museum's API to return the relevant data,
  including the image URL for each work, and merge them into a single array, which we
  then use to visualize on the page.

  The things I wanted to do that I didn't have time to do included adding in the 
  relevant artwork information to the card, like its title, year, classification 
  and medium, like a  proper museum might have next to the work. But you know how
  these things go: the design in your head and the clock on the wall don't always
  align. Do what you can with the time you have and move on from there.

  If I were to keep this project going, I would begin sourcing other museum APIs
  to connect to and really turn this thing into a global library that encompasses
  every piece of art that's publicly available and not held in some private collection
  that no one will ever see. I tried connecting to the API at the Louvre museum
  (https://collections.louvre.fr/en/page/documentationJSON) but I ran into a CORS
  error that I just didn't have enough time to figure out. But that would have been
  a great addition to this thing.

  Overall, I learned a ton and will absolutely use what I've learned in this class
  in my professional career. This shit is not easy, it takes a minute to really wrap
  your head around some of this stuff, but Jeremiah and Dani made it possible for
  an old man like me to learn a few new tricks.

  Mario

*/



// empty array to hold image URLs
let imageArray = [];

// hey look i know these guys
function createNewCard() {
  let cardElement = document.createElement("div");
  cardElement.classList.add("card");
  return cardElement;
};

// they make cards
function appendNewCard(parentElement) {
  let cardElement = createNewCard();
  document.querySelector('#card-container').appendChild(cardElement);
  return cardElement;
};

// shout out to D-dizzle & J-dog
function createCards(parentElement) {

  for (let i = 0; i < imageArray.length; i++) {
    let cards = [];
    let newcard = appendNewCard(parentElement);
    let object = {
      index: i,
      element: newcard,
      imageid: imageArray[i]
    }
    newcard.innerHTML = `<img src="${imageArray[i]}" class="image" width="100%"></img>`;
    cards.push(object);
  }
}

// this function resets cards
function resetCards() {
  let cards = document.getElementById("card-container");
  while (cards.firstChild) {
    cards.removeChild(cards.firstChild);
  };
}

// this fuctions searches the Art Institute of Chicago
function searchCHI() {

  // clear the board of all previous cards
  // not doing this just stacks images on
  // top of other images
  // learned this the hard way
  resetCards();

  //receive user input from search bar
  let userInput = document.querySelector('#inputArtist').value;

  //use the input to get the proper artist name and id
  axios.get(`https://api.artic.edu/api/v1/agents/search?q=${userInput}`).then(response => {
    let artistName = response.data.data[0].title;

    // clg to sanity check and store id as variable
    console.log(`Found: ${artistName}`);
    let artistId = response.data.data[0].id;

    //use artist id to retrieve all art by that artist
    axios.get(`https://api.artic.edu/api/v1/artworks/search?query[term][artist_id]=${artistId}&limit=100&fields=id,title,artist_title,image_id,date_end`).then(response => {
      // grab the final image url for each item found
      // push URL to the global array
      for (let i = 0; i < response.data.data.length; i++) {
        let METurl = `https://www.artic.edu/iiif/2/${response.data.data[i].image_id}/full/843,/0/default.jpg`
        imageArray.push(METurl);
      };
      // visually display on the webpage the artist we're talking about
      // this is necessary in case you wanna see some Rembrandts
      // and so you type in Rembrandt but then it shows you art by
      // some guy called Rembrandt Peale, an American painter
      // instead of Rembrandt van Rijn, the Dutch realist painter
      // who is who most people talk about when they say Rembrandt
      document.querySelector('#CHIartistName').innerText = artistName.toUpperCase();
    });
  });
};


// same thing as above but for the Met in NYC
function searchMET() {

  // clear the board of all previous cards
  // not doing this just stacks images on
  // top of other images
  // learned this the hard way
  resetCards();

  //receive user input from search bar
  let userInput = document.querySelector('#inputArtist').value;

  // search the Met by the input, focusing on artist names and paintings with images
  axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&q=${userInput}`).then(response => {

    // push array of image IDs to a variable
    let METartworkList = [];
    response.data.objectIDs.forEach(element => METartworkList.push(element))

    // use this array of IDs to grab the URL for each image 
    // push URL to the global array
    METartworkList.forEach(element => axios.get(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${element}`).then(response => {
      if (response.data.primaryImage.length > 5) {
        imageArray.push(response.data.primaryImage);
      }
    })
    )
  })
}

// this function resets the global array to
// clear from previous search and then runs
// both search functions
// not clearing the array means you need to
// refresh the page to start a new search
// learned this the hard way
function searchALL() {
  imageArray = [];
  searchCHI();
  searchMET();
};

// allow a 5 second for the searches to go through
// before creating cards
function populateGallery() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(createCards('#card-container'));
    }, 5000);
  });
}

// run the above two functions
async function showALL() {
  searchALL();
  const result = await populateGallery();
  return result;
}

// make it so you can run your search on the enter key
// shoutout to Jocelyn, much appreciate the feedback
document.querySelector('#inputArtist').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    showALL();
  }
});
