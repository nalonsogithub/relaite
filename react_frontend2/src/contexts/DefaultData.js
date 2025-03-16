export const defaultListingJson = {
  listing: {
    master_listing_id: '2985A273-B82C-474C-9BF0-95616BAE4B88',
    active: 1,
    listing_id: '401322D3-EE3A-4A37-9D61-7076266D5C4C',
    listing_details: {
      listing_image_id: 'BAC4C2D7-BE2E-404E-A79D-C5AB8CDB7091',
      listing_agent_id: '4F139923-89B0-481A-BC52-FCCF3751698D',
      listing_assistant_name: 'Laura Boutin',
      listing_description: '278 Mayfair',
      listing_address: '278 Mayfair Road, Dennis, MA 02660',
    },
    images_0: {
      image_id: 'BAC4C2D7-BE2E-404E-A79D-C5AB8CDB7091',
      image_file_name: 'MayfairFront.jpg',
      image_url: 'blob:http://localhost:5000/44d348c1-ff28-479c-b52b-cc338df5168d',
      image_description: '19 Woekel - Great Place!',
    },
  },
  assistant: {
    listing_id: '401322D3-EE3A-4A37-9D61-7076266D5C4C',
    assistant_id_OAI: 'asst_V5aZGa382g2SwW7sdD9hJm2w',
    assistant_description: '278 Mayfair',
  },
  carousel: 
[
  {
    "carousel_type": null,
    "image_click_system_prompt": "Can you provide key details about Dennis, MA, that would be important for home buyers, such as local amenities, housing trends, community highlights, and lifestyle benefits?",
    "image_click_user_prompt": "Give me some details on Dennis, MA",
    "image_file_name": "DennisMA.png",
    "image_order": 2,
    "image_tile_description": "Welcome to Dennis!",
    "image_tile_destination": "neighborhood",
    "image_tile_instructions": "**Explore the Neighborhood!** Click the image to start your immersive journey.\n\n- **Navigate the map** for a comprehensive view of local hotspots and hidden gems.\n- **Curious about the area?** Engage with our chatbot for detailed conversations about neighborhood highlights.\n- **Discover the lifestyle!** Click to uncover what makes Dennis, MA, a perfect place to call home.\n- **Get answers fast.** Our chatbot is ready to provide insights, from amenities to housing trends.\n- **See it all come to life!** Tap for a rich, interactive experience that showcases everything this neighborhood has to offer.\n",
    "listing_id": "401322D3-EE3A-4A37-9D61-7076266D5C4C",
    "site_location": "neighborhood"
  },
  {
    "carousel_type": null,
    "image_click_system_prompt": "Can you search your vector store and find the bio.txt and tell me about the background of the listing agent please?\n\nYou should also search this bio.txt document for any contact information related to the Agent ",
    "image_click_user_prompt": "Tell me about the listing agent",
    "image_file_name": "AgentBoutinPic.jpg",
    "image_order": 3,
    "image_tile_description": "Meet your Host!",
    "image_tile_destination": "agent",
    "image_tile_instructions": "**Meet Your Agent** Click the image to read the agents Bio.\n\n**Get contact information and ask questions of the agent at your leisure**",
    "listing_id": "401322D3-EE3A-4A37-9D61-7076266D5C4C",
    "site_location": "agent"
  },
  {
    "carousel_type": "main",
    "image_click_system_prompt": "Tell me the details for the home at 278 Mayfair Road. Use only the provided details and do not make up or alter any numbers:\n\nProperty Overview:\n\nAddress: 278 Mayfair Road, Dennis, MA 02660\nMLS Number: 73291655\nListing Price: $545,999\nStyle: Ranch\nApproximate Living Area: 1,308 SqFt\nLot Size: 7,405 SqFt\nYear Built: 1958 (Renovated in 1993)\nInterior Details:\n\nTotal Rooms: 6\nBedrooms: 3\nBathrooms: 1 Full, 1 Half\nLiving Room: Fireplace, Skylight, Cathedral Ceiling, Beamed Ceiling, Hardwood Floors\nDining Room: Skylight, Hardwood Floors\nKitchen: Hardwood Floors, Exterior Access\nMain Bedroom: Wall-to-Wall Carpet, Closet\nOther Bedrooms: Hardwood Floors, Closet\nRespond using only these details and do not invent or infer additional information.",
    "image_click_user_prompt": "Give me some details on this home.",
    "image_file_name": "MayfairFront.jpg",
    "image_order": 1,
    "image_tile_description": "Welcome to 278 Mayfair :)",
    "image_tile_destination": "home",
    "image_tile_instructions": "**Explore This Home!** Click for a detailed tour and renovation ideas.\n\n- **See how you can transform this space** with our creative renovation suggestions.\n- **Dreaming of a makeover?** Click to explore renovation possibilities for this home.\n- **Imagine the changes!** Tap here to see potential renovations and upgrades.\n- **Unlock the home's potential.** Click for inspiring renovation ideas and details.\n- **Show me the equity...** Sweat Equity, that is!",
    "listing_id": "401322D3-EE3A-4A37-9D61-7076266D5C4C",
    "site_location": "home"
  }
],	
  games:
		{
		  "bin_game": {
			"images_0": {
			  "image_description": "Spacious and Bright Bathroom",
			  "image_file": "MayfairBathroom.jpg",
			  "image_id": "E45E15C0-6676-4A99-8F07-04DF41F37F04",
			  "image_name": "",
			  "image_order": 20,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "f1d18fde-fffc-4f0e-9349-d599bd1270e6",
			  "location_id": "45896731-7a50-4b91-b621-65e47f83e68a"
			},
			"images_1": {
			  "image_description": "Modern Kitchen with Updated Appliances",
			  "image_file": "MayfairKitchen1.jpg",
			  "image_id": "5D72EABA-DD22-4355-B8C9-0EECAC558D08",
			  "image_name": "",
			  "image_order": 8,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "a12bf7a6-dc3d-4200-80d9-84e630f9bc26",
			  "location_id": "a115625b-d5f8-47fb-8f6c-fd3478856cfc"
			},
			"images_2": {
			  "image_description": "Unique Outdoor Shower Experience",
			  "image_file": "MayfairOutdoorShower.jpg",
			  "image_id": "352772C6-A27D-456A-9927-278B54441C36",
			  "image_name": "",
			  "image_order": 22,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "8e73677d-2eb1-4064-827d-12ab9d23ad38",
			  "location_id": "bed3d5f2-6a65-49a0-96a4-cbf07ee7a2bf"
			},
			"images_3": {
			  "image_description": "Inviting Three-Seasons Room",
			  "image_file": "Mayfair3Seasons.jpg",
			  "image_id": "39580F15-37DD-4F17-A403-31D0F638120E",
			  "image_name": "",
			  "image_order": 5,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "09ebf116-8cf5-451e-8997-9bbcb57bd7b8",
			  "location_id": "4c5fe332-4f0f-443e-9612-113d45c9ab85"
			},
			"images_4": {
			  "image_description": "Peaceful Master Bedroom Retreat",
			  "image_file": "MayfairBedroom.jpg",
			  "image_id": "F7DBEDE6-28A4-459F-89BB-3CA0AC88B34A",
			  "image_name": "",
			  "image_order": 17,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "1ee155a5-5af0-4e00-92e8-b740d0b39f4b",
			  "location_id": "1ac495cd-1a71-49e5-a831-e56a6232667b"
			},
			"images_5": {
			  "image_description": "Stylish Kitchen with Ample Storage",
			  "image_file": "MayfairKitchen2.jpg",
			  "image_id": "A1E6EFB2-A810-40B3-84F2-49C687EC504A",
			  "image_name": "",
			  "image_order": 10,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "ef2a9a83-9d1a-4f40-a3a1-0c44dae651a7",
			  "location_id": "c71bb847-a43a-4591-8c92-6b716587e660"
			},
			"images_6": {
			  "image_description": "Serene Backyard View",
			  "image_file": "MayfairRearhome.jpg",
			  "image_id": "8E9DB34F-A8A2-4E10-937E-5D6902644A5F",
			  "image_name": "",
			  "image_order": 3,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "ae595015-3684-48cb-b2fa-150c2b73aef0",
			  "location_id": "a125b930-a6ca-4bfe-9230-ff33377aed7d"
			},
			"images_7": {
			  "image_description": "Elegant Dining Area for Entertaining",
			  "image_file": "MayfairDiningroom.jpg",
			  "image_id": "7E9EBF07-CA89-4635-BCD4-BA6C879199C1",
			  "image_name": "",
			  "image_order": 15,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "166a1c52-de9a-4f09-8378-99a03ef01eb3",
			  "location_id": "95051c09-a850-4e1d-b63e-fdc87f7e54c4"
			},
			"images_8": {
			  "image_description": "Cozy and Spacious Living Room",
			  "image_file": "MayfairLivingroom.jpg",
			  "image_id": "F2D4489B-91CF-4AC7-8F5D-C15A469B7697",
			  "image_name": "",
			  "image_order": 12,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "9ebf1950-929b-4497-97cd-7cd8a5097d2e",
			  "location_id": "20f11f9e-b270-4658-962d-57622ac8245e"
			},
			"images_9": {
			  "image_description": "Charming Front View of Home",
			  "image_file": "MayfairFront.jpg",
			  "image_id": "C14CF9DF-CAE6-4F64-85C8-FFD9900C6E31",
			  "image_name": "",
			  "image_order": 0,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "3239591f-19ae-4db7-ada3-64b761906fe9",
			  "location_id": "6887ac61-f28d-43d6-a8e3-2f7fbabcb0c1"
			},
			"questions_0": {
			  "image_id": null,
			  "iqmap": "3239591f-19ae-4db7-ada3-64b761906fe9",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Was your first impression positive or negative??",
			  "question_order": 0,
			  "question_type": "yn"
			},
			"questions_1": {
			  "image_id": null,
			  "iqmap": "1ee155a5-5af0-4e00-92e8-b740d0b39f4b",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Was the bedroom large enough?",
			  "question_order": 0,
			  "question_type": "yn"
			},
			"questions_2": {
			  "image_id": null,
			  "iqmap": "09ebf116-8cf5-451e-8997-9bbcb57bd7b8",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Would you use this room?",
			  "question_order": 0,
			  "question_type": "yn"
			},
			"questions_3": {
			  "image_id": null,
			  "iqmap": "ef2a9a83-9d1a-4f40-a3a1-0c44dae651a7",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Does the kitchen need updating IYO?",
			  "question_order": 0,
			  "question_type": "yn"
			},
			"questions_4": {
			  "image_id": null,
			  "iqmap": "f1d18fde-fffc-4f0e-9349-d599bd1270e6",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Is the bathroom size sufficient?",
			  "question_order": 0,
			  "question_type": "yn"
			}
		  },
		  "image_bubble_game": {
			"images_0": {
			  "image_description": "",
			  "image_file": "Mayfair3Seasons.jpg",
			  "image_id": "E8DF992F-AA3C-42FA-9C71-0D90971E86A3",
			  "image_name": "",
			  "image_order": 0,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "90eff3f2-6786-4a4b-a52b-fa0ac3e90181",
			  "location_id": "519ccbeb-2b38-45e9-926e-4bf10f6272cf"
			},
			"images_1": {
			  "image_description": "",
			  "image_file": "WelcomeToDennis.jpg",
			  "image_id": "41D4C43A-79DE-4545-B11A-3A02EB545512",
			  "image_name": "",
			  "image_order": 1,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "location_id": "b675643e-6e7f-4c3b-aa3e-f66d3f97957c"
			},
			"images_2": {
			  "image_description": "",
			  "image_file": "MayfairFront.jpg",
			  "image_id": "7BBAF062-C6FF-45DD-AF5A-F09419CBE062",
			  "image_name": "",
			  "image_order": 2,
			  "image_system_prompt": "",
			  "image_user_prompt": "",
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "location_id": "98a4c160-5da2-48f5-a5e7-e967d8c30595"
			},
			"questions_0": {
			  "image_id": null,
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Childhood Memories",
			  "question_order": 2,
			  "question_type": "yn"
			},
			"questions_1": {
			  "image_id": null,
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Love!",
			  "question_order": 3,
			  "question_type": "yn"
			},
			"questions_10": {
			  "image_id": null,
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Boating",
			  "question_order": 1,
			  "question_type": "yn"
			},
			"questions_11": {
			  "image_id": null,
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Beaches",
			  "question_order": 0,
			  "question_type": "yn"
			},
			"questions_12": {
			  "image_id": null,
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Sweat Equity",
			  "question_order": 5,
			  "question_type": "yn"
			},
			"questions_13": {
			  "image_id": null,
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "No Bueno",
			  "question_order": 0,
			  "question_type": "yn"
			},
			"questions_14": {
			  "image_id": null,
			  "iqmap": "90eff3f2-6786-4a4b-a52b-fa0ac3e90181",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Tea Time",
			  "question_order": 3,
			  "question_type": "yn"
			},
			"questions_2": {
			  "image_id": null,
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Project",
			  "question_order": 1,
			  "question_type": "yn"
			},
			"questions_3": {
			  "image_id": null,
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Rental",
			  "question_order": 4,
			  "question_type": "yn"
			},
			"questions_4": {
			  "image_id": null,
			  "iqmap": "90eff3f2-6786-4a4b-a52b-fa0ac3e90181",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Cigar!",
			  "question_order": 2,
			  "question_type": "yn"
			},
			"questions_5": {
			  "image_id": null,
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "As Expected",
			  "question_order": 4,
			  "question_type": "yn"
			},
			"questions_6": {
			  "image_id": null,
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Sunshine",
			  "question_order": 5,
			  "question_type": "yn"
			},
			"questions_7": {
			  "image_id": null,
			  "iqmap": "690a8c83-7fcd-483f-bc7f-1cc59e3266c5",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Needs Paint",
			  "question_order": 2,
			  "question_type": "yn"
			},
			"questions_8": {
			  "image_id": null,
			  "iqmap": "89c91f58-8777-419e-8d12-06c0d19068df",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Retirement",
			  "question_order": 3,
			  "question_type": "yn"
			},
			"questions_9": {
			  "image_id": null,
			  "iqmap": "90eff3f2-6786-4a4b-a52b-fa0ac3e90181",
			  "listing_id": "401322d3-ee3a-4a37-9d61-7076266d5c4c",
			  "question": "Renovate?",
			  "question_order": 0,
			  "question_type": "yn"
			}
		  }
		},	
	
	
  agent: 
		{
		  "agent_id": "4F139923-89B0-481A-BC52-FCCF3751698D",
		  "images_0": {
			"image_description": "Second Logo",
			"image_file_name": "AdvisorsLivingLogoFull.png",
			"image_id": "81DA2E9C-6CC5-41C6-85F6-7283E5B8BB57",
			"image_url": "blob:https://www.openhouseaigent.com/155f04d6-2f78-41b9-b4a3-ca60655a8394"
		  },
		  "images_1": {
			"image_description": "First Logo",
			"image_file_name": "AdvisorsLivingALogo.jpg",
			"image_id": "E255F5D7-F715-443A-B961-C4C9353F1E12",
			"image_url": "blob:https://www.openhouseaigent.com/12b24b71-0550-4274-ab94-dfad3f74cbee"
		  },
		  "listing_agent_description": "278 Mayfair - I don't know how much info we can squeeze into one small space but I'm going to type in just about as much as i feel like typing and see how it goes!",
		  "listing_agent_logo_id": "0E75BD6F-3B06-435B-8450-B846906269FF",
		  "listing_agent_name": "Patrick Brusil",
		  "listing_id": "401322D3-EE3A-4A37-9D61-7076266D5C4C",
		  "logos_0": {
			"agent_id": "4F139923-89B0-481A-BC52-FCCF3751698D",
			"listing_agent_logo_id": "0E75BD6F-3B06-435B-8450-B846906269FF",
			"logo_description": "First Logo  ",
			"logo_image_id": "81DA2E9C-6CC5-41C6-85F6-7283E5B8BB57"
		  },
		  "logos_1": {
			"agent_id": "4F139923-89B0-481A-BC52-FCCF3751698D",
			"listing_agent_logo_id": "0E75BD6F-3B06-435B-8450-B846906269FF",
			"logo_description": "Second Logo ",
			"logo_image_id": "E255F5D7-F715-443A-B961-C4C9353F1E12"
		  }
		}	  
	  
};

export const defaultListingDetails = {
  listing_id: '401322D3-EE3A-4A37-9D61-7076266D5C4C',
  listing_agent_name: 'Patrick Brusil',
  listing_assistant_name: 'Laura Boutin',
  listing_agent_description:
    "278 Mayfair - I don't know how much info we can squeeze into one small space but I'm going to type in just about as much as I feel like typing and see how it goes!",
  listing_description: '278 Mayfair ',
  listingImage:
    'https://hbbreact.blob.core.windows.net/hbbblob2/401322d3-ee3a-4a37-9d61-7076266d5c4c/MayfairFront.jpg',
  listingImage_path: 'MayfairFront.jpg',
  listing_address: '278 Mayfair Road, Dennis, MA 02660',
  logoImageOne:
    'https://hbbreact.blob.core.windows.net/hbbblob2/401322d3-ee3a-4a37-9d61-7076266d5c4c/AdvisorsLivingLogoFull.png',
  logoImageOne_path: 'AdvisorsLivingLogoFull.png',
  logoImageTwo:
    'https://hbbreact.blob.core.windows.net/hbbblob2/401322d3-ee3a-4a37-9d61-7076266d5c4c/AdvisorsLivingALogo.jpg',
  logoImageTwo_path: 'AdvisorsLivingALogo.jpg',
};

export default { defaultListingJson, defaultListingDetails };
