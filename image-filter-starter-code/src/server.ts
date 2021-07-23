import express, { Router, Request, Response } from "express";
import bodyParser from "body-parser";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file
  app.get("/filteredimage/", async (req: Request, res: Response) => {
    const imageUrl = req.query.image_url;
    if (!imageUrl) {
      return res.status(400).send({ message: "Image_url is required" });
    }
    await filterImageFromURL(imageUrl).then((filePath) => {
      if (filePath == "FailedToDownload") {
        console.log("Issues in downloading image from the provided url");
        //returning it as a bad request
        return res.status(422).send({ message: "Couldn't download the image. Please check the image-url" });
      } else {
        res.status(200).sendFile(filePath, () => {
          deleteLocalFiles([filePath]);
        });
      }
    });
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
