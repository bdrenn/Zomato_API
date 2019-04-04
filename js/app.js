//23:42, https://www.youtube.com/watch?v=WJdY_RtXrU0


//Structure requests
class ZOMATO {
    //Generating request through zomatos format
    constructor(){
        //Api key
        this.api = "6ebf9e8de821b0466bca6edfb2f80ec9";
        this.header = {
            method: 'GET',
            headers: {
                'user-key': this.api,
                'Content-Type':'application/json'
            },
            credentials:'same-origin'
        };
    }
    async searchAPI(city,categoryID){
        //Generarted from zomatos documentation of categories, category URL
        const categoryURL = `https://developers.zomato.com/api/v2.1/categories`;
        //city URL
        const cityURL = `https://developers.zomato.com/api/v2.1/cities?q=${city}`;



        //fetch needs url and header - holds all categories
        const categoryInfo = await fetch(categoryURL,this.header);
        //Get back object categories 
        const categoryJSON = await categoryInfo.json();
        //Access object categories array
        const categories = await categoryJSON.categories;

        //search city
        const cityInfo = await fetch(cityURL,this.header);
        const cityJSON = await cityInfo.json();
        const cityLocation = await cityJSON.location_suggestions;

        let cityID = 0;

        if(cityLocation.length > 0){
            cityID = await cityLocation[0].id;
        }

        //search restaurant
        const restaurantURl = `https://developers.zomato.com/api/v2.1/search?entity_id=${cityID}&entity_type=city&category=${categoryID}&sort=rating`
        const restaurantInfo = await fetch(restaurantURl, this.header);
        const restaurantJSON = await restaurantInfo.json();
        const restaurants = await restaurantJSON.restaurants;



        //returns all categories
        return {
            categories,
            cityID,
            restaurants
        };
    }
}

class UI {
    constructor(){
        this.loader = document.querySelector('.loader');
        this.restaurantList = document.getElementById('restaurant-list');
    }
    addSelectOptions(categories){
        const search = document.getElementById('searchCategory');
        let output = `<option value='0' selected>select category</option> `;
        //categories in the drop down menu from the API
        categories.forEach(category =>{
            output += `<option value="${category.categories.id}">${category.categories.name}</option>`;
        });
        search.innerHTML = output;
    }
    //error message for improper entry
    showFeedback(text){
        const feedback = document.querySelector('.feedback');
        feedback.classList.add('showItem');
        feedback.inner = `<p>${text}</p>`
        setTimeout(()=>{
            feedback.classList.remove('showItem');
        },3000);
    }

    showLoader(){
        this.loader.classList.add('showItem');
    }
    hideLoader(){
        this.loader.classList.remove('showItem');
    }
    getRestaurants(restaurants){
        this.hideLoader();
        if(restaurants.length === 0){
            this.showFeedback('no such categories exist in the selected city');
        }
        else {
            this.restaurantList.innerHTML = '';
            restaurants.forEach((restaurant) => {
                const {thumb:img,name,location:{address},user_rating:{aggregate_rating},cousines,average_cost_for_two:cost,menu_url,url} = restaurant.restaurant;

                if(img !== ''){
                    this.showRestaurant(img,name,address,aggregate_rating,cousines,cost,menu_url,url)
                }
            })
        }
    }
    showRestaurant(img,name,address,aggregate_rating,cousines,cost,menu_url,url){
        const div = document.createElement('div');
        div.classList.add('col-11', 'mx-auto','my-3','col-md-4');
        div.innerHTML = ` <div class="card">
        <div class="card">
         <div class="row p-3">
          <div class="col-5">
           <img src="${img}" class="img-fluid img-thumbnail" alt="">
          </div>
          <div class="col-5 text-capitalize">
           <h6 class="text-uppercase pt-2 redText">${name}</h6>
           <p>${address}</p>
          </div>
          <div class="col-1">
           <div class="badge badge-success">
            ${aggregate_rating}
           </div>
          </div>
         </div>
         <hr>
         <div class="row py-3 ml-1">
          <div class="col-5 text-uppercase ">
           <p>cousines :</p>
           <p>cost for two :</p>
          </div>
          <div class="col-7 text-uppercase">
           <p>${cousines}</p>
           <p>${cost}</p>
          </div>
         </div>
         <hr>
         <div class="row text-center no-gutters pb-3">
          <div class="col-6">
           <a href="${menu_url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> menu</a>
          </div>
          <div class="col-6">
           <a href="${url}" target="_blank" class="btn redBtn  text-uppercase"><i class="fas fa-book"></i> website</a>
          </div>
         </div>
        </div>
       </div>
  
       <!-- item -->
  
      </div>`;
        this.restaurantList.appendChild(div);
    }
}

(function(){
    const searchForm = document.getElementById('searchForm');
    const searchCity = document.getElementById('searchCity');
    const searchCategory = document.getElementById('searchCategory');

    const zomato = new ZOMATO();

    const ui = new UI();

    //add select options
    document.addEventListener('DOMContentLoaded', ()=>{
        //data from the categories drop down
        zomato.searchAPI().then(data => ui.addSelectOptions(data.categories));
});

//submit form for search bar 
searchForm.addEventListener("submit",event =>{
    //stops from automatically reloading
    event.preventDefault();

    const city = searchCity.value.toLowerCase();
    const categoryID = parseInt(searchCategory.value);

    if(city === "" || categoryID === 0){
        ui.showFeedback('please enter a city and select category');
    }
    else {
        //logic goes here
        zomato.searchAPI(city).then(cityData => {
            if(cityData.cityID === 0){
                ui.showFeedback('please enter a valid city!')
            }
            else{
                ui.showLoader();
                zomato.searchAPI(city,categoryID).then(data => {
                    ui.getRestaurants(data.restaurants);
                });
            }
        });
    }

});

})();