import express from 'express';
import cors from 'cors';
import { getAllChallenges, getChallengeById } from '../challengesController/challengesController';

//if the route returns hi then the express js is working
router.get('/', cors(), (req, res) => {
    res.json('hi');
  });

router.get('/challenges', cors(), getAllChallenges);
// route to get a challenge by id
router.get('/challenges/:id', cors(), getChallengeById);