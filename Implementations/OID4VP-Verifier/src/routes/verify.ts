import Router from "express"
import * as verificationController from "../controllers/verificationController";

const router = Router();
import {Request, Response } from 'express';


router.post('/',async (req: Request, res: Response) => {
   let result = await verificationController.verify(req.body.vp_token);
   if (result){
    res.status(200).send("Verified!")
   }
   else{
    res.status(500).send("Could not verify!")
   }
  });

module.exports = router;