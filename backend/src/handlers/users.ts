import { Request, Response } from "express";
import { CreateUserDto } from "../dtos/CreateUser.dto";

export function getUsers(request: Request, response: Response) {
    response.send([]);
}

export function getUserById(request: Request, response: Response) {
    response.send({});
}

export function createUser(request: Request<{}, {}, CreateUserDto>, response: Response) {
    console.log(request.body.username);
}
