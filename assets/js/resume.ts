let Resume = {
  closeLoader: () => {
    setTimeout(()=> {
      $('#loader, .page-wrap').addClass('loaded');   
      $('body').toggleClass('disable-scroll'); 
    },1000);    
    setTimeout(()=> {
      $('#loader').remove();    
    },2000);     
  }
};
