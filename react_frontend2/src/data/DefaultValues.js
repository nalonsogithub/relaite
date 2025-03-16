// Sample JSON structure for the listing
const sampleListingJson = {
  listing: {
    listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
    listing_details: {
      listing_image_id: "c206fd21-d6db-4b62-ad5a-9d95bbb6caf5",
      listing_agent_id: "166e41f9-6675-4183-9177-0bd716a615ad",
      listing_assistant_name: "19 Woekel FUCKER",
      listing_description: "19 Woekel - Great Place!",
      listing_address: "19 Woekel Terrace, Methuen, MA 01844"
    },
    images_0: {
      image_id: "c206fd21-d6db-4b62-ad5a-9d95bbb6caf5",
      image_file_name: "19-Woekel--Home-Front.gif",
      image_url: "https://hbbreact.blob.core.windows.net/hbbblob2/2b78c611-af06-4449-a5b6-fb2d433faf8b/19-Woekel--Home-Front.gif",
      image_description: "19 Woekel - Great Place to live!"
    }
  },
  assistant: {
        listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
        assistant_id_OAI: "asst_n8vcg0cDb7D6jgohlTUfSJTU",
        assistant_description: "19 Woekel - Great Place!"
  },
  carousel: [
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "home",
		  image_order: 1,
		  image_file_name: "19-Woekel--Home-Front.gif",
		  image_tile_destination: "home",
		  image_tile_description: "Discuss home details and renovation ideas",
		  image_tile_instructions: "**Explore this home**! Click for a detailed tour and renovation ideas\\n- See how you can transform this space with our creative renovation suggestions\\n- Dreaming of a makeover? Click to explore renovation possibilities for this home\\n- Imagine the changes! Tap here to see potential renovations and upgrades\\n- Unlock the home's potential. Click for inspiring renovation ideas and details\\n- Show me the equity... Sweat Equity, that is!\\n",
		  image_click_user_prompt: "Give me some details on this home.",
		  image_click_system_prompt: "Tell me about the features of 19 Woekel Terrace.  Make sure these facts are listed exactly as follows {listing price: $679,900}, {Bedrooms: 3}, {Bathrooms: 2.5}, {lot: 0.88-acre}, {Living space: 2,890 SqFt}, {Additinal Basement: 1,500 SqFt}"
	  },
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "neighborhood",
		  image_order: 2,
		  image_file_name: "Welcome-to-Methuen.gif",
		  image_tile_destination: "neighborhood",
		  image_tile_description: "Get to know Methuen, MA",
		  image_tile_instructions: "**Explore this neighborhood**! Click for more details on the local area:\\n- Discover the best local restaurants and cafes around the corner\\n- Check out the top-rated schools in the neighborhood for your kids\\n- Learn about the community vibe and meet your potential new neighbors\\n- Dive into neighborhood history and unique landmarks nearby\\n",
		  image_click_user_prompt: "Tell me about the neighborhood.",
		  image_click_system_prompt: "I'm considering moving to Methuen, MA, and would love to know more about the area from a prospective resident's point of view. Could you tell me about the local amenities, quality of schools, community feel, transportation options, housing market, and any unique features that make Methuen a good place to live?"
	  },
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "agent",
		  image_order: 3,
		  image_file_name: "Patrick-Brusil-Headshot.gif",
		  image_tile_destination: "agent",
		  image_tile_description: "Get to know your agent, Patrick",
		  image_tile_instructions: "**Meet your agent**! Click to learn more about me:\\n- I\u2019ve helped countless families find their dream home in this area\\n- With years of experience, I can guide you through every step of the buying process\\n- I know this neighborhood inside and out, and I\u2019m here to answer all your questions\\n- Let\u2019s chat! I\u2019m just a click away if you\u2019re ready to schedule a tour or need more information\\n",
		  image_click_user_prompt: "Tell me about Patrick Brusil",
		  image_click_system_prompt: "I'm interested in getting to know the real estate agent, Patrick Brusil, a bit better before working with them. Can you tell me about their experience, what they specialize in, and their approach to helping clients find the perfect home? I'm also curious about any personal touches or unique qualities they bring to their work."
	  },
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "mortgage",
		  image_order: 4,
		  image_file_name: "MortgageCalculator_2.webp",
		  image_tile_destination: "mortgage",
		  image_tile_description: "Try our Mortgage Calculator",
		  image_tile_instructions: "**Try our mortgage calculator**! Click to estimate your monthly payments:\\n- See how different down payments and interest rates affect your mortgage\\n- Curious about your monthly costs? Get an instant estimate with our easy-to-use calculator\\n- Input your loan details and find out what you can expect to pay each month\\n- Ready to plan? Click here to calculate your mortgage and take control of your budget\\n",
		  image_click_user_prompt: "",
		  image_click_system_prompt: ""
	  },
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "loan",
		  image_order: 5,
		  image_file_name: "Loan_Approval.webp",
		  image_tile_destination: "loan",
		  image_tile_description: "Understand the Loan Pre-Approval Process",
		  image_tile_instructions: "**Get preapproved for your loan**! Click to start the process:\\n- Discuss how much home you can afford\\n- Ready to buy? Get preapproved now and take the first step toward home ownership\\n- I\u2019ll guide you through the process to ensure you\u2019re set up with the best loan options\\n- Click here to get started on your preapproval and make your offer stand out\\n",
		  image_click_user_prompt: "Can you help me get pre-approved for a loan.",
		  image_click_system_prompt: "I'm interested in getting pre-approved for a mortgage. Can you guide me through the process? I\u2019d like to understand what documents I need to provide, what types of loans might be available (like fixed-rate vs. adjustable, or conventional vs. FHA), and how my credit score and income will affect my approval. Also, could you explain any steps I can take to improve my chances of getting the best rate and what to expect during the underwriting process?"
	  },
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "summary",
		  image_order: 6,
		  image_file_name: "SummarizeConvo.gif",
		  image_tile_destination: "summary",
		  image_tile_description: "Summarize our conversation",
		  image_tile_instructions: "**Review your conversations**! Click to see a summary of everything we\u2019ve discussed:\\n- Revisit all the questions you\u2019ve asked and the answers we\u2019ve provided\\n- Keep track of any notes you have taken throughout our conversation\\n- Want to refresh your memory? \\n- Click here for a complete overview of your interactions\\n",
		  image_click_user_prompt: "Summarize our conversation so far.",
		  image_click_system_prompt: "Could you summarize our conversation so far in the form of a letter? Start with a greeting and an introduction, and if I\u2019ve asked you to take any notes during the conversation, include them as a bulleted list. Finish with a conclusion and sign off with 'Sincerely, Your AIgent.'"
	  },
	  {
		  listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
		  carousel_type: "main",
		  site_location: "back",
		  image_order: 7,
		  image_file_name: "ReturnHome.gif",
		  image_tile_destination: "welcome",
		  image_tile_description: "Return to Welcome page",
		  image_tile_instructions: "**Return to the Welcome Page**! \\n",
		  image_click_user_prompt: "",
		  image_click_system_prompt: ""
	  }
  ],
  games: {
		bin_game: {
			images_0: {
				image_id: "8305f33e-17df-44d4-9f4e-8908b1632a32",
                image_name: "image_003",
                image_file: "19-Woekel--Garage.gif",
                image_description: "Garage",
                image_user_prompt: "Give me some details on the garage",
                image_system_prompt: "Give the user details on the garage.  Be specific and mention some renovation ideas.",
                image_order: 2,
                location_id: "07dcab0c-66b6-42dd-bb9a-c5f46134b335"
            },
            images_1: {
                image_id: "e4bcfb3c-c3fe-4f63-98a5-60e73cfb14ca",
                image_name: "image_001",
                image_file: "19-Woekel--Bathroom.gif",
                image_description: "Main Bathroom",
                image_user_prompt: "Give me some details on the bathroom",
                image_system_prompt: "Give the user details on the bathroom.  Be specific and mention some renovation ideas.",
                image_order: 0,
                location_id: "fd0200ad-497b-46c5-a9b7-229b7b063c06"
            },
            images_2: {
                image_id: "ee1627ab-3708-49c4-8de7-c3d093a1e972",
                image_name: "image_005",
                image_file: "19-Woekel--Kitchen.gif",
                image_description: "Kitchen",
                image_user_prompt: "Give me some details about the kitchen",
                image_system_prompt: "Give the user details on the front of the kitchen.  Be specific and mention some renovation ideas.",
                image_order: 5,
                location_id: "77ce8d27-3435-4ed3-9938-74dc5bb4587b"
            },
            images_3: {
                image_id: "a74a095b-d5a4-4db9-8e81-d4f816e5bd99",
                image_name: "image_004",
                image_file: "19-Woekel--Home-Front.gif",
                image_description: "Front",
                image_user_prompt: "Give me some details on the Front",
                image_system_prompt: "Give the user details on the front of the house.  Be specific and mention some renovation ideas.",
                image_order: 4,
                location_id: "15170509-3113-4113-a7f5-35f837d678a4"
            },
            images_4: {
                image_id: "4ebd1f71-f8bb-45e5-8a18-67f6a8cb298d",
                image_name: "image_002",
                image_file: "19-Woekel--Dining-Room.gif",
                image_description: "Dining Room",
                image_user_prompt: "Give me some details on the dining room",
                image_system_prompt: "Give the user details on the dining room.  Be specific and mention some renovation ideas.",
                image_order: 1,
                location_id: "51cadced-4cb8-4b0b-a388-3b5f98c3befe"
            },
            questions_0: {
                image_id: "8305f33e-17df-44d4-9f4e-8908b1632a32",
                question: "Think it can also fit a snow blower?",
                question_type: "yn",
                question_order: 3
            },
            questions_1: {
                image_id: "e4bcfb3c-c3fe-4f63-98a5-60e73cfb14ca",
                question: "Is the room big enough?",
                question_type: "yn",
                question_order: 2
            },
            questions_2: {
                image_id: "ee1627ab-3708-49c4-8de7-c3d093a1e972",
                question: "Are the appliances dated?",
                question_type: "yn",
                question_order: 2
            }

        },
        image_bubble_game: {
            images_0: {
                image_id: "c6006d7d-42db-45b7-b53d-d554cef8a727",
                image_name: "image3",
                image_file: "Patrick-Brusil-Headshot.gif",
                image_description: "Headshot of the real estate agent Patrick Brusil",
                image_user_prompt: "",
                image_system_prompt: "",
                image_order: 3,
                location_id: "fb9756bb-350e-46a8-853f-2d520fa632ba"
            },
            images_1: {
                image_id: "45dca00b-bb46-4130-8c3b-f135791c7e73",
                image_name: "image1",
                image_file: "19-Woekel--Home-Front.gif",
                image_description: "Front view of the home",
                image_user_prompt: "",
                image_system_prompt: "",
                image_order: 1,
                location_id: "6d86fcf0-a2f4-48a1-9fc8-2b24b17cc1dc"
            },
            images_2: {
                image_id: "a8ade823-52f8-457d-ac09-ad13cde637f8",
                image_name: "IMG_INTRO",
                image_file: "19-Woekel--Home-Front.gif",
                image_description: "Intro Image - Home Front",
                image_user_prompt: "",
                image_system_prompt: "",
                image_order: 0,
                location_id: "3ccfb4ef-962d-4209-9e58-935ce9b07418"
            },
            images_3: {
                image_id: "d1130de1-6bd4-4fb6-b2d7-0f0624d2ed99",
                image_name: "image2",
                image_file: "Welcome-to-Methuen.gif",
                image_description: "Welcome sign for the Methuen area",
                image_user_prompt: "",
                image_system_prompt: "",
                image_order: 2,
                location_id: "743286d9-c569-46d0-9151-165ffa505008"
            },
            questions_0: {
                image_id: "c6006d7d-42db-45b7-b53d-d554cef8a727",
                question: "Super Cool Guy",
                question_type: "yn",
                question_order: 5
            },
            questions_1: {
                image_id: "a8ade823-52f8-457d-ac09-ad13cde637f8",
                question: "From Below?",
                question_type: "yn",
                question_order: 4
            },
            questions_2: {
                image_id: "a8ade823-52f8-457d-ac09-ad13cde637f8",
                question: "Hike",
                question_type: "yn",
                question_order: 6
            },
        }
  },
  questions: {
	  predetermined_questions_0: {
		question_id: "0149235b-2641-44f0-a253-732102fb1e23",
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		system_prompt_text: "INTRO",
		response_text:
		  "**Welcome to the future of real estate!** Our site revolutionizes the home-buying experience by bringing you a **virtual open house agent** that’s always just a tap away. Have questions about a home’s price, location, or potential renovations? Our AI-powered agent is here to provide instant answers, helping you make informed decisions as you browse. With this new level of interactivity, you can tour homes with confidence, knowing you’ve got the expertise and insights you need right at your fingertips! **Click Anywhere to get started!**",
	  },
	  predetermined_questions_1: {
		question_id: "b79e616b-1799-435c-a3ea-9ac2f9cd26dd",
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		system_prompt_text: "HOMEDETAIL",
		response_text:
		  "**Hi there!** Welcome to **19 Woekel Terrace**, located in Methuen, MA. Let me tell you more about this lovely home. The listing price is **$679,900**, and this home offers: - **3 Bedrooms** and **2.5 Bathrooms** on a single floor. - A total of **2,890 SqFt** of living space, with an additional **1,500 SqFt** finished in the basement.\n- A **living room** with **hardwood floors** and a charming **stone fireplace**.\n- A large kitchen boasting **custom cabinetry** and modern **stainless steel appliances**.\n- A basement with a **wet bar**, perfect for hosting or relaxing.\n- A sprawling **0.88-acre fenced yard**, providing both privacy and space for potential expansions. Have any questions or thoughts about this home? I'm happy to help!",
	  },
	  predetermined_questions_2: {
		question_id: "70b1ebab-fc3d-4d1f-94d1-296d8cd9d0af",
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		system_prompt_text: "INTRO",
		response_text:
		  "**Get ready for an experience you've never had before in real estate!** Our platform transforms the way you engage with properties by combining advanced AI with the power of personalized home shopping. Imagine having a **virtual open house agent** always available in your pocket to answer questions, guide you through property details, and even suggest renovation ideas, all in real-time! This isn't just a website—it's your go-to resource for making smart decisions. Whether you're exploring homes online or standing in front of your dream property, our AI agent is ready to help you every step of the way.\n**Click Anywhere to get started!**",
	  },
	  site_location_questions_0: {
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		SITE_LOCATION: "agent",
		quick_question: "Tell me about Patrick",
		quick_question_system_prompt:
		  "Let us details of the agent selling this house. Patrick Brusil. Speak from the first person and in a tone of a Boston native.",
		qucik_question_order: 2,
	  },
	  site_location_questions_1: {
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		SITE_LOCATION: "image detail",
		quick_question: "Renovation Ideas?",
		quick_question_system_prompt: "Let us discuss some renovation ideas for this image",
		qucik_question_order: 1,
	  },
	  conversation_topic_questions_0: {
		question_id: "5cdf074e-0910-4dcc-9c0e-03b38ac29172",
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		CONVOTOP: "comparison",
		quick_question: "Differences?",
		quick_question_system_prompt: "What are the main differences between this property and others nearby?",
		qucik_question_order: 2,
	  },
	  conversation_topic_questions_1: {
		question_id: "e887c051-eeea-4c6d-8b81-8ba011570900",
		listing_id: "45c3a3d4-2292-43b8-b915-70a99ea74599",
		CONVOTOP: "buying-process",
		quick_question: "Steps?",
		quick_question_system_prompt: "Can you outline the steps involved in buying this property?",
		qucik_question_order: 2,
	  },
  },
	
	
  agent: {
        agent_id: "166e41f9-6675-4183-9177-0bd716a615ad",
        listing_id: "2b78c611-af06-4449-a5b6-fb2d433faf8b",
        listing_agent_name: "Patrick Brusil",
        listing_agent_logo_id: "61c84f52-bd80-4469-ae66-5fef0f807b15",
        listing_agent_description: "Friendly and to the point.",
        logos_0: {
            listing_agent_logo_id: "61c84f52-bd80-4469-ae66-5fef0f807b15",
            logo_image_id: "e54498c4-0462-4e50-ab20-30825dd36a5f",
            agent_id: "166e41f9-6675-4183-9177-0bd716a615ad",
            logo_description: "First Logo"
        },
        logos_1: {
            listing_agent_logo_id: "61c84f52-bd80-4469-ae66-5fef0f807b15",
            logo_image_id: "8e452291-7fc6-47ae-8a73-babac2b5f40b",
            agent_id: "166e41f9-6675-4183-9177-0bd716a615ad",
            logo_description: "Second Logo"
        },
        images_0: {
            image_id: "e54498c4-0462-4e50-ab20-30825dd36a5f",
            image_file_name: "19-Woekel---Brusil-logo.gif",
            image_url: "https://hbbreact.blob.core.windows.net/hbbblob2/19-Woekel---Brusil-logo.gif",
            image_description: "First Logo"
        },
        images_1: {
            image_id: "8e452291-7fc6-47ae-8a73-babac2b5f40b",
            image_file_name: "19-Woekel---KW-logo.gif",
            image_url: "https://hbbreact.blob.core.windows.net/hbbblob2/19-Woekel---KW-logo.gif",
            image_description: "Second Logo"
        }
    }
	
};

export default sampleListingJson;
