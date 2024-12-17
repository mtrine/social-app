import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Post } from "./schema/post.schema";
import { CreatePostDto } from "./dto/create-post.dto";
import { User } from "../users/schema/user.schema";

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private postModel: Model<Post>,
        @InjectModel(User.name) private userModel: Model<User>
    ) { }


    async createPost(createPostDto: CreatePostDto) {
        try {
            return await this.postModel.create({
                authorId: createPostDto.authorId,
                content: createPostDto.content,
                media: createPostDto.media,
            });
        } catch (error) {
            throw error;
        }
    }


    async deletePost(postId: string) {
        try {
            return this.postModel.findByIdAndDelete(postId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getMyPosts(userId: string,take:number,skip:number) {
        try {
            return await this.postModel.find(
                { authorId: userId, isDeleted: false }
            ).limit(take).skip(skip);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getMixedNewsfeed(userId: string, take: number, skip: number) {
        try {
            // Bước 1: Lấy danh sách người dùng mà userId đang theo dõi
            const user = await this.userModel.findById(userId).select('following');
    
            if (!user) throw new Error('User not found');
    
            const followingIds = user.following || []; // Danh sách ID của người dùng được theo dõi
    
            // Bước 2: Truy vấn các bài viết từ người dùng được theo dõi
            const followingPosts = this.postModel.find({
                authorId: { $in: followingIds },
                isDeleted: false,
            })
            .sort({ createdAt: -1 }) // Sắp xếp theo thời gian mới nhất
            .limit(take / 2) // Chia một phần limit cho các bài viết từ người theo dõi
            .skip(skip);
    
            // Bước 3: Truy vấn các bài viết ngẫu nhiên khác (không thuộc người dùng đã theo dõi)
            const randomPosts = this.postModel.aggregate([
                { $match: { 
                    authorId: { $nin: followingIds.concat(new Types.ObjectId(userId)) }, // Loại bỏ userId và người theo dõi
                    isDeleted: false,
                }},
                { $sample: { size: Math.ceil(take / 2) } }, // Lấy ngẫu nhiên
            ]);
    
            // Bước 4: Kết hợp 2 kết quả và trả về
            const [postsFromFollowing, postsFromRandom] = await Promise.all([
                followingPosts,
                randomPosts,
            ]);
    
            const mixedNewsfeed = [...postsFromFollowing, ...postsFromRandom]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sắp xếp lại
            
            return mixedNewsfeed;
        } catch (error) {
            console.error('Error fetching mixed newsfeed:', error);
            throw error;
        }
    }
    
    

    async createComment(postId: string, userId: string, content: string) {
        try {
            return this.postModel.findByIdAndUpdate(postId, {
                $push: {
                    comments: {
                        userId,
                        content,
                        createdAt: new Date(),
                    },
                },
            })
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }

    async countDocuments(condition: any) {
        return await this.postModel.countDocuments(condition);
    }

    async likePost(postId: string, userId: string) {
        try {
            return this.postModel.findByIdAndUpdate(postId, {
                $push: {
                    likes: userId,
                },
            })
        } catch (error) {
            throw error;
        }
    }

    async unlikePost(postId: string, userId: string) {
        try {
            return this.postModel.findByIdAndUpdate(postId, {
                $pull: {
                    likes: userId,
                },
            })
        }
        catch (error) {
            throw error;
        }
    
    }
}