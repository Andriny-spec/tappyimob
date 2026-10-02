import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as fs from "fs";
import * as path from "path";

const BACKUP_XML_PATH = "/home/willian/Área de Trabalho/tappyimob/_backups/data/4269/4269 backup.xml";

function extractListings(xmlContent: string): Map<string, { price: number; rentPrice: number; description: string }> {
  const listings = new Map<string, { price: number; rentPrice: number; description: string }>();
  
  // Split by </Listing> to get individual listings
  const listingBlocks = xmlContent.split("</Listing>");
  
  for (const block of listingBlocks) {
    // Extract ListingID
    const idMatch = block.match(/<ListingID>([^<]+)<\/ListingID>/);
    if (!idMatch) continue;
    
    const code = idMatch[1];
    
    // Extract ListPrice
    const priceMatch = block.match(/<ListPrice[^>]*>(\d+)<\/ListPrice>/);
    const price = priceMatch ? parseInt(priceMatch[1], 10) : 0;
    
    // Extract RentalPrice (if exists)
    const rentMatch = block.match(/<RentalPrice[^>]*>(\d+)<\/RentalPrice>/);
    const rentPrice = rentMatch ? parseInt(rentMatch[1], 10) : 0;
    
    // Extract Description
    const descMatch = block.match(/<Description><!\[CDATA\[([\s\S]*?)\]\]><\/Description>/);
    let description = descMatch ? descMatch[1] : "";
    
    // Clean description - convert HTML to readable text
    description = description
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&bull;/g, "•")
      .replace(/&nbsp;/g, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<b>/gi, "**")
      .replace(/<\/b>/gi, "**")
      .replace(/<i>/gi, "_")
      .replace(/<\/i>/gi, "_")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    
    listings.set(code, { price, rentPrice, description });
  }
  
  return listings;
}

export async function GET(request: NextRequest) {
  try {
    // Read backup XML
    if (!fs.existsSync(BACKUP_XML_PATH)) {
      return NextResponse.json({ error: "Backup XML not found" }, { status: 404 });
    }
    
    const xmlContent = fs.readFileSync(BACKUP_XML_PATH, "utf-8");
    const listings = extractListings(xmlContent);
    
    // Get properties from database
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        code: true,
        price: true,
        rentPrice: true,
        description: true,
      },
    });
    
    // Find mismatches
    const mismatches: any[] = [];
    let matchCount = 0;
    let notFoundCount = 0;
    
    for (const property of properties) {
      const listing = listings.get(property.code);
      
      if (!listing) {
        notFoundCount++;
        continue;
      }
      
      const priceDiff = listing.price !== property.price;
      const rentDiff = listing.rentPrice !== (property.rentPrice || 0);
      const descDiff = listing.description && property.description !== listing.description;
      
      if (priceDiff || rentDiff) {
        mismatches.push({
          code: property.code,
          dbPrice: property.price,
          xmlPrice: listing.price,
          dbRentPrice: property.rentPrice,
          xmlRentPrice: listing.rentPrice,
          priceDiff,
          rentDiff,
        });
      } else {
        matchCount++;
      }
    }
    
    return NextResponse.json({
      totalInDb: properties.length,
      totalInXml: listings.size,
      matches: matchCount,
      mismatches: mismatches.length,
      notFoundInXml: notFoundCount,
      sampleMismatches: mismatches.slice(0, 20),
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { dryRun = true, updateDescription = true, codes = [] } = body;
    
    // Read backup XML
    if (!fs.existsSync(BACKUP_XML_PATH)) {
      return NextResponse.json({ error: "Backup XML not found" }, { status: 404 });
    }
    
    const xmlContent = fs.readFileSync(BACKUP_XML_PATH, "utf-8");
    const listings = extractListings(xmlContent);
    
    console.log(`Parsed ${listings.size} listings from XML`);
    
    // Get properties from database
    const whereClause = codes.length > 0 ? { code: { in: codes } } : {};
    const properties = await prisma.property.findMany({
      where: whereClause,
      select: {
        id: true,
        code: true,
        price: true,
        rentPrice: true,
        description: true,
      },
    });
    
    console.log(`Found ${properties.length} properties in database`);
    
    const updates: any[] = [];
    const notFound: string[] = [];
    const noChanges: string[] = [];
    
    for (const property of properties) {
      const listing = listings.get(property.code);
      
      if (!listing) {
        notFound.push(property.code);
        continue;
      }
      
      const updateData: any = {};
      const changes: string[] = [];
      
      // Check price
      if (listing.price !== property.price) {
        updateData.price = listing.price;
        changes.push(`price: ${property.price} -> ${listing.price}`);
      }
      
      // Check rentPrice - only update if XML has a value (don't overwrite with 0)
      if (listing.rentPrice > 0 && listing.rentPrice !== (property.rentPrice || 0)) {
        updateData.rentPrice = listing.rentPrice;
        changes.push(`rentPrice: ${property.rentPrice || 0} -> ${listing.rentPrice}`);
      }
      
      // Check description
      if (updateDescription && listing.description && property.description !== listing.description) {
        updateData.description = listing.description;
        changes.push(`description updated`);
      }
      
      if (Object.keys(updateData).length === 0) {
        noChanges.push(property.code);
        continue;
      }
      
      updates.push({
        id: property.id,
        code: property.code,
        changes,
        updateData,
      });
      
      // Apply update if not dry run
      if (!dryRun) {
        // Buscar updatedAt atual antes de atualizar
        const currentProp = await prisma.property.findUnique({ where: { id: property.id }, select: { updatedAt: true } });
        await prisma.property.update({
          where: { id: property.id },
          data: updateData,
        });
        // Preservar updatedAt original — sync não deve alterar essa data
        if (currentProp) {
          await prisma.$executeRaw`UPDATE "properties" SET "updatedAt" = ${currentProp.updatedAt} WHERE "id" = ${property.id}`;
        }
      }
    }
    
    return NextResponse.json({
      dryRun,
      totalProcessed: properties.length,
      updated: updates.length,
      noChanges: noChanges.length,
      notFoundInXml: notFound.length,
      updates: updates.slice(0, 50),
      notFoundSample: notFound.slice(0, 20),
    });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
