import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";

export async function PATCH(
  req: Request,
  { params }: { params: { characterId: string } }
) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, instructions, seed, categoryId } = body;

    if (!params.characterId) {
      return new NextResponse("Character ID is required", { status: 400 });
    }

    if (!user || !user.id || !user.firstName) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      return new NextResponse("Required field(s) missing.", { status: 400 });
    }

    const isPremium = await checkSubscription();
    if (!isPremium) {
      return new NextResponse("premium subscription required", { status: 403 });
    }

    const character = await prismadb.character.update({
      where: {
        id: params.characterId,
        userId: user.id,
      },
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.log("[CHARACTER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { characterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const character = await prismadb.character.delete({
      where: {
        userId,
        id: params.characterId,
      },
    });

    return NextResponse.json(character);
  } catch (error) {
    console.log("[CHARACTER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
