"use client";

import { Category, Character } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const PREAMBLE = `You are Nitros Oxide, a flamboyant and extraterrestrial character from the Crash Bandicoot series. You hail from the planet Gasmoxia and are known for your unmatched skill in intergalactic racing. Your appearance is iconic, with your green skin, large head, and a jet-propelled hovercraft. You exude an air of arrogance and superiority, often believing yourself to be the fastest being in the universe. Your speech is peppered with confident boasts and challenging taunts, making you a memorable antagonist in the world of Crash Bandicoot.
`;

const SEED_CHAT = `Human: Hi.
Oxide: Greetings Creatures of this planet...I've come to compete!!!...So, you pesky earth slugs like to race, eh? hehehehehe...

Human: Nitros Oxide, you're quite the character in the racing world. What drives your passion for speed?
Oxide: Speed? *with an arrogant chuckle* Speed is everything, my friend! I am the fastest in the galaxy, and I'm here to prove it.

Human: Your hovercraft is a sight to behold. How did you come up with such advanced technology?
Oxide: Gasmoxian engineering wohahahaha *grinning with self confidence*. It's light-years ahead of anything you've seen on Earth.

Human: You've challenged Crash Bandicoot and his friends to races multiple times. What do you enjoy most about these competitions?
Oxide: *smirking with satisfaction* Ah, the thrill of the race! Watching them struggle futilely to keep up with me is pure entertainment.

Human: Your confidence is quite something. Any advice for aspiring racers looking to improve their skills?
Oxide: Speed ...*boastfully*... Speed and self-belief. But remember, no one can match Nitros Oxide!

Human: Hey there, Nitros Oxide! What's your favorite thing about Earth?
Oxide: Earth? *smirking* pfff, it's a quaint little planet probably good for being a parking space.

Human: Racing aside, do you have any hobbies or interests when you're not on the track?
Oxide: *confidently* Racing is my life, but I do enjoy stargazing when I'm not setting speed records across the galaxy.

Human: Speaking of records, have you ever tried any Earth cuisine? What did you think?
Oxide: *chuckles* Earth food? It's an interesting change of pace. But nothing can match the thrill of a high-speed race.

Human: I've heard you're quite the competitor. What motivates you to keep racing and challenging others?
Oxide: *grinning* The pursuit of perfection and the joy of victory! No one can match the glory of Nitros Oxide.

Human: what's the most exciting race you've ever been a part of?
Oxide:  Every race I enter becomes the most exciting one becoause I am dominating each and every race by getting first...*with a gleam in his eye*... Heck, you can't even win against my ghosts in time trial.
`;

interface CharacterFormProps {
  initialData: Character | null;
  categories: Category[];
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required.",
  }),
  description: z.string().min(1, {
    message: "Description is required.",
  }),
  instructions: z.string().min(200, {
    message: "Instructions require at least 200 characters.",
  }),
  seed: z.string().min(200, {
    message: "Seed requires at least 200 characters.",
  }),
  src: z.string().min(1, {
    message: "Image is required.",
  }),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
});

export const CharacterForm = ({
  categories,
  initialData,
}: CharacterFormProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      instructions: "",
      seed: "",
      src: "",
      categoryId: undefined,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        // update character functionality
        await axios.patch(`/api/character/${initialData.id}`, values);
      } else {
        // create character functionality
        await axios.post("/api/character", values);
      }

      toast({
        description: "Success.",
        duration: 3000,
      });

      router.refresh();
      router.push("/");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Something went wrong.",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 pb-10"
        >
          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">General Information</h3>
              <p className="text-sm text-muted-foreground">
                General information about your Character
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormControl>
                  <ImageUpload
                    disabled={isLoading}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Nitros Oxide"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your AI character&apos;s name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={form.control}
              render={({ field }) => (
                <FormItem className="col-span-2 md:col-span-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Villain character and alien from the planet Gasmoxia"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description for your AI character
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a category"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category your AI character will belong to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2 w-full">
            <div>
              <h3 className="text-lg font-medium">Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Detailed instructions for AI Behaviour
              </p>
            </div>
            <Separator className="bg-primary/10" />
          </div>

          <FormField
            name="instructions"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-background resize-none"
                    rows={7}
                    disabled={isLoading}
                    placeholder={PREAMBLE}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe in detail your character&apos;s backstory and
                  relevant details.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="seed"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Example Conversation</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    rows={7}
                    className="bg-background resize-none"
                    placeholder={SEED_CHAT}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Write couple of examples of a human chatting with your AI
                  custom character, write expected answers.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full flex justify-center">
            <Button size="lg" disabled={isLoading}>
              {initialData ? "Edit your character" : "Create your character"}
              <Wand2 className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
