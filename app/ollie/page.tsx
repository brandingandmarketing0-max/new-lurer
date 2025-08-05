import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Heart, Eye, Share2, Star, Crown, Sparkles } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white p-4 overflow-x-hidden">
      <div className="flex min-h-screen items-center justify-center px-2">
        <div className="w-full max-w-md mx-auto">
          {/* Main Profile Card */}
          <Card className="relative overflow-hidden border border-gray-200 bg-white shadow-lg">
            <CardContent className="p-8">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <Crown className="h-4 w-4 text-yellow-500" />
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  Premium
                </Badge>
              </div>

              {/* Profile Header */}
              <div className="flex flex-col items-center space-y-6">
                {/* Avatar with border */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gray-200 rounded-full opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <Avatar className="relative h-28 w-28 border-4 border-white shadow-lg">
                    <AvatarImage src="/images/ollie1.png" alt="Summermae" className="object-cover" />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-2xl font-bold">
                      SM
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Verified Badge */}
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg ring-4 ring-white">
                    <Image
                      src="/images/verified-badge.png"
                      alt="Verified Badge"
                      width={20}
                      height={20}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>

                {/* Name and Status */}
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                    Summermae
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                  </h1>
                </div>

                {/* Platform Badge */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 p-1">
                    <Image
                      src="/images/of-logo.png"
                      alt="OnlyFans Logo"
                      width={24}
                      height={24}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-gray-700 font-medium">OnlyFans Creator</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Preview Card - Now Clickable */}
          <Link href="https://onlyfans.com/kingollie01" target="_blank" rel="noopener noreferrer">
            <Card className="mt-6 relative overflow-hidden border border-gray-200 bg-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-0">
                <div className="relative group">
                  <Image
                    src="/images/ollie2.png"
                    alt="Exclusive Content Preview"
                    width={400}
                    height={300}
                    className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/20"></div>
                  
                  {/* Content Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge className="bg-gray-900 text-white border-0">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        OF
                      </span>
                    </Badge>
                  </div>

                  {/* Lock Icon */}
                  <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm text-white">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Action Buttons */}
          <div className="mt-6 space-y-4">
            <Link href="https://onlyfans.com/kingollie01" target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 shadow-lg">
                <Heart className="h-5 w-5 mr-2" />
                Subscribe Now
              </Button>
            </Link>
            <Link href="https://onlyfans.com/kingollie01" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                View All Content
              </Button>
            </Link>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Join thousands of fans enjoying exclusive content
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 