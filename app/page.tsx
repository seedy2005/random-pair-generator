"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Users, Shuffle } from "lucide-react"
import Papa from "papaparse"

interface Pair {
  person1: string
  person2?: string
}

export default function RandomPairGenerator() {
  const [names, setNames] = useState<string[]>([])
  const [pairs, setPairs] = useState<Pair[]>([])
  const [isUploaded, setIsUploaded] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      complete: (results) => {
        // Extract names from CSV data, filter out empty rows
        const nameList = results.data
          .flat()
          .map((name: any) => String(name).trim())
          .filter((name: string) => name.length > 0)

        setNames(nameList)
        setIsUploaded(true)
        setPairs([]) // Clear previous pairs
      },
      header: false,
      skipEmptyLines: true,
    })
  }

  const generatePairs = () => {
    if (names.length === 0) return

    // Create a copy of names array and shuffle it
    const shuffledNames = [...names].sort(() => Math.random() - 0.5)
    const newPairs: Pair[] = []

    // Generate pairs
    for (let i = 0; i < shuffledNames.length; i += 2) {
      if (i + 1 < shuffledNames.length) {
        // Regular pair
        newPairs.push({
          person1: shuffledNames[i],
          person2: shuffledNames[i + 1],
        })
      } else {
        // Odd person out
        newPairs.push({
          person1: shuffledNames[i],
        })
      }
    }

    setPairs(newPairs)
  }

  const resetApp = () => {
    setNames([])
    setPairs([])
    setIsUploaded(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Random Pair Generator
          </CardTitle>
          <p className="text-card-foreground text-lg">
            Upload a CSV file with names and generate random pairs instantly
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isUploaded ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-upload" className="text-card-foreground font-medium">
                  Upload CSV File
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="bg-input border-border"
                  />
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Upload a CSV file with one name per row</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">Uploaded Names ({names.length} total)</h3>
                <div className="max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {names.map((name, index) => (
                      <div key={index} className="truncate">
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={generatePairs}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  size="lg"
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  Generate Pairs
                </Button>
                <Button
                  onClick={resetApp}
                  variant="outline"
                  className="border-border text-card-foreground hover:bg-muted bg-transparent"
                >
                  Reset
                </Button>
              </div>

              {pairs.length > 0 && (
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-card-foreground mb-4">Generated Pairs ({pairs.length} pairs)</h3>
                  <div className="space-y-3">
                    {pairs.map((pair, index) => (
                      <div key={index} className="bg-background rounded-md p-3 border border-border">
                        <div className="flex items-center justify-center">
                          {pair.person2 ? (
                            <span className="text-card-foreground font-medium">
                              {pair.person1} & {pair.person2}
                            </span>
                          ) : (
                            <span className="text-card-foreground font-medium">
                              {pair.person1} <span className="text-muted-foreground">(unpaired)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
