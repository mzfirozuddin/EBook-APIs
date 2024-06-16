import app from "./src/app";
import { config } from "./src/config/config";
import connectDB from "./src/db/db";

const startServer = async () => {
    // Connect Database
    await connectDB();

    const port = config.port || 3000;

    app.listen(port, () => {
        console.log(`Server is listening on port ${port}...`);
    });
};

startServer();
