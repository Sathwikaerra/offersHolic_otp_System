import Offer from "../../models/Offer.js";
import BusinessProfile from "../../models/BusinessProfile.js";


const share = async (req, res) => {
  const { type, id } = req.params;
  
  if ((type !== "ad" && type !== "businessProfile") || !id) {
    return res.status(400).json({ message: 'Invalid request' });
  }

  let title, description, imageUrl, url;

  try {
    if (type === "ad") {
      const offer = await Offer.findById(id);

      if (!offer) {
        return res.status(404).json({ message: 'Offer not found' });
      }

      title = `Check out this amazing offer: ${offer.title} on OffersHolic!`;
      description = offer.description;
      imageUrl = offer.featuredImage;
      url = `offersholic://ad/${offer._id}`;
    } else if (type === "businessProfile") {
      const business = await BusinessProfile.findById(id);

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      title = `Explore this business: ${business.name} on OffersHolic!`;
      description = business.description;
      imageUrl = business.logo;
      url = `offersholic://businessProfile/${business._id}`;
    }

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          
          <!-- Open Graph Metadata -->
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:url" content="${url}">
          <meta property="og:type" content="website">

          <!-- Twitter Metadata -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <meta name="twitter:image" content="${imageUrl}">
          <meta name="twitter:url" content="${url}">

          <style>
              body {
                  background-color: #c82037;
                  color: #ffffff;
                  font-family: Lexend, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
              }
              .container {
                  text-align: center;
                  padding: 20px;
                  border: 1px solid #333;
                  border-radius: 8px;
                  background-color: #ffffff;
              }
              .icon {
          
                  height: 50px;
                  margin-bottom: 20px;
              }
              .title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 10px;
                                   font-family: Lexend, sans-serif;

                  color: #232122;
              }
              .description {
                  font-size: 18px;
                  margin-bottom: 20px;
                  color: #232122;
                  font-family: Lexend, sans-serif;


              }
              .image {
                  width: 100%;
                  max-width: 150px;
                  max-height: 300px;
                  resize-mode: 'cover';
                  border-radius: 8px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <img 
               "
              class="icon" src="https://admin.offersholic.zephyrapps.in/_next/image?url=%2Fimages%2Fprimary-transparent.png&w=256&q=75" alt="App Icon">
              <div class="title">${title}</div>
              <div class="description">${description}</div>
              <img class="image" src="${imageUrl}" alt="Preview Image">
              <p>Download our app <a href="${url}" style="color: #1e90ff;">Open in App</a></p>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error sharing:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default share;
