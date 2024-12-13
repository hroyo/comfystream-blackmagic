import { NextRequest, NextResponse } from "next/server";

export const POST = async function POST(req: NextRequest) {
  const { endpoint, prompt, offer } = await req.json();

  try {
    const res = await fetch(endpoint + "/offer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, offer }),
    });

    // Check if the response is JSON
    const contentType = res.headers.get("Content-Type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Expected JSON, but got non-JSON response.");
    }

    // Parse and return the JSON response
    return NextResponse.json(await res.json(), { status: res.status });
  } catch (error) {
    console.error("Error during fetch:", error);
    return NextResponse.json({ error: "Failed to process the offer" }, { status: 500 });
  }
};
