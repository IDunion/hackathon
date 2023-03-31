import Router from "express"
import * as authController from "../controllers/authController";

const router = Router();
import { Request, Response } from 'express';


router.get('/', async (req: Request, res: Response) => {
  const authRequest = await authController.handleAuthInitiation();
  res.status(200).send(authRequest);
});

router.get('/:id', async (req: Request, res: Response) => {
  const authRequestObject = await authController.handleCallback(req.params.id);
  if(authRequestObject)
  res.status(200).send(authRequestObject);
  else{
    res.status(404).send(`auth request process with given id ${req.params.id} does not exist`)
  } 
});

module.exports = router;

