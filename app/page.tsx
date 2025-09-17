"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Shuffle, FileSpreadsheet } from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface Person {
  name: string
  gender: "male" | "female"
}

interface Pair {
  male: string
  female: string
}

export default function RandomPairGenerator() {
  const [people, setPeople] = useState<Person[]>([])
  const [pairs, setPairs] = useState<Pair[]>([])
  const [unpaired, setUnpaired] = useState<Person[]>([])
  const [isUploaded, setIsUploaded] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const parseExcelFile = (file: File): Promise<Person[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

          const peopleList: Person[] = []
          jsonData.forEach((row: any) => {
            if (row.length >= 2 && row[0] && row[1]) {
              const name = String(row[0]).trim()
              const gender = String(row[1]).toLowerCase().trim()
              if (name && (gender === "male" || gender === "female")) {
                peopleList.push({ name, gender })
              }
            }
          })
          resolve(peopleList)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsArrayBuffer(file)
    })
  }

  const parseCSVFile = (file: File): Promise<Person[]> => {
    return new Promise((resolve) => {
      Papa.parse(file, {
        complete: (results) => {
          const peopleList: Person[] = []
          results.data.forEach((row: any) => {
            if (Array.isArray(row) && row.length >= 2) {
              const name = String(row[0]).trim()
              const gender = String(row[1]).toLowerCase().trim()
              if (name && (gender === "male" || gender === "female")) {
                peopleList.push({ name, gender })
              }
            }
          })
          resolve(peopleList)
        },
        header: false,
        skipEmptyLines: true,
      })
    })
  }

  const handleFileUpload = async (file: File) => {
    try {
      let peopleList: Person[] = []

      if (file.name.endsWith(".csv")) {
        peopleList = await parseCSVFile(file)
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        peopleList = await parseExcelFile(file)
      } else {
        alert("Please upload a CSV or Excel file")
        return
      }

      setPeople(peopleList)
      setIsUploaded(true)
      setPairs([])
      setUnpaired([])
    } catch (error) {
      console.error("Error parsing file:", error)
      alert("Error parsing file. Please check the format.")
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file) {
      handleFileUpload(file)
    }
  }, [])

  const generatePairs = () => {
    if (people.length === 0) return

    const males = people.filter((person) => person.gender === "male")
    const females = people.filter((person) => person.gender === "female")

    // Shuffle both arrays
    const shuffledMales = [...males].sort(() => Math.random() - 0.5)
    const shuffledFemales = [...females].sort(() => Math.random() - 0.5)

    const newPairs: Pair[] = []
    const newUnpaired: Person[] = []

    // Create pairs
    const minLength = Math.min(shuffledMales.length, shuffledFemales.length)
    for (let i = 0; i < minLength; i++) {
      newPairs.push({
        male: shuffledMales[i].name,
        female: shuffledFemales[i].name,
      })
    }

    // Add unpaired people
    if (shuffledMales.length > minLength) {
      newUnpaired.push(...shuffledMales.slice(minLength))
    }
    if (shuffledFemales.length > minLength) {
      newUnpaired.push(...shuffledFemales.slice(minLength))
    }

    setPairs(newPairs)
    setUnpaired(newUnpaired)
  }

  const resetApp = () => {
    setPeople([])
    setPairs([])
    setUnpaired([])
    setIsUploaded(false)
  }

  const maleCount = people.filter((p) => p.gender === "male").length
  const femaleCount = people.filter((p) => p.gender === "female").length

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-border shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Users className="h-10 w-10 text-primary" />
            Random Pair Generator
          </CardTitle>
          <p className="text-card-foreground text-lg">
            Upload a CSV or Excel file with names and genders to generate male-female pairs
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isUploaded ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-card-foreground font-medium">
                  Upload CSV or Excel File
                </Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-card-foreground font-medium mb-2">
                    Drag & drop your file here, or click to browse
                  </p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleInputChange}
                    className="bg-input border-border cursor-pointer"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or Excel file with two columns: Name, Gender (male/female)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-4 border border-border">
                <h3 className="font-semibold text-card-foreground mb-2">
                  Uploaded People ({people.length} total: {maleCount} males, {femaleCount} females)
                </h3>
                <div className="max-h-32 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                    {people.map((person, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{person.name}</span>
                        <span className={person.gender === "male" ? "text-blue-600" : "text-pink-600"}>
                          {person.gender}
                        </span>
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
                  disabled={maleCount === 0 || femaleCount === 0}
                >
                  <Shuffle className="h-5 w-5 mr-2" />
                  Generate Male-Female Pairs
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
                          <span className="text-card-foreground font-medium">
                            <span className="text-blue-600">{pair.male}</span> &{" "}
                            <span className="text-pink-600">{pair.female}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {unpaired.length > 0 && (
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <h3 className="font-semibold text-card-foreground mb-4">Unpaired People ({unpaired.length})</h3>
                  <div className="space-y-2">
                    {unpaired.map((person, index) => (
                      <div key={index} className="bg-background rounded-md p-2 border border-border text-center">
                        <span className={`font-medium ${person.gender === "male" ? "text-blue-600" : "text-pink-600"}`}>
                          {person.name} ({person.gender})
                        </span>
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
