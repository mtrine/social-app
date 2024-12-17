import { Module} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schema/post.schema';
import { PostsRepository } from './posts.repository';
import { User, UserSchema } from '../users/schema/user.schema';

@Module({
  imports : [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema },{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [PostsController],
  providers: [PostsService,PostsRepository],
})
export class PostsModule {}
