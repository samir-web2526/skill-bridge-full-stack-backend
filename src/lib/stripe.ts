// import { envVars } from '../config/env';
// import Stripe from 'stripe';

// const stripe: any = new Stripe(envVars.STRIPE_SECRET_KEY);

// export default stripe;

import { envVars } from "../config/env";
import Stripe from "stripe";

const stripe:ReturnType<typeof Stripe> = new Stripe(envVars.STRIPE_SECRET_KEY);

export default stripe;